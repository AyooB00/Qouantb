import { NextRequest, NextResponse } from 'next/server'
import { AIProviderFactory } from '@/lib/ai-providers/provider-factory'
import { FinnhubClient } from '@/lib/finnhub'
import { toolDefinitions, executeToolCall, ToolCall } from '@/lib/finchat/tools'
import OpenAI from 'openai'
import { ResponseParser } from '@/lib/finchat/response-parser'
import { SmartComponent } from '@/lib/types/finchat'
import { handleAPIError, validateRequired, APIError } from '@/lib/api/error-handler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, stream = true, provider, locale = 'en' } = body

    validateRequired(body, ['messages'])
    if (!Array.isArray(messages)) {
      throw new APIError('Messages must be an array', 400, 'INVALID_MESSAGES')
    }

    // For function calling, we need to use OpenAI directly
    const useOpenAI = provider === 'openai' || !provider
    
    if (useOpenAI && process.env.OPENAI_API_KEY) {
      // Use OpenAI with function calling
      return handleOpenAIChat(messages, stream, locale)
    } else {
      // Fallback to regular chat without function calling
      return handleRegularChat(messages, stream, provider, locale)
    }

  } catch (error) {
    return handleAPIError(error)
  }
}

async function handleOpenAIChat(messages: OpenAI.Chat.ChatCompletionMessageParam[], stream: boolean, locale: string = 'en') {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
  
  // Build financial context
  const lastMessage = messages[messages.length - 1]
  const content = typeof lastMessage.content === 'string' ? lastMessage.content : ''
  const financialContext = await buildFinancialContext(content)

  // Language instructions based on locale
  const languageInstruction = locale === 'ar' 
    ? 'You MUST respond in Arabic (العربية). All your responses, analysis, and explanations must be in Arabic. However, keep stock symbols (like AAPL, MSFT) and currency symbols ($) in English.'
    : 'Respond in English.'

  // Create system prompt
  const systemMessage: OpenAI.Chat.ChatCompletionSystemMessageParam = {
    role: 'system' as const,
    content: `You are FinChat, an expert financial AI assistant with access to real-time market data and analysis tools.

${languageInstruction}

Your capabilities:
- Real-time stock quotes and market data
- Technical and fundamental analysis
- Portfolio analysis and recommendations
- Risk management and position sizing
- Market overview and sentiment analysis

CRITICAL INSTRUCTIONS FOR SMART COMPONENTS:
1. YOU MUST use the available tools for ANY query about:
   - Specific stock prices or quotes → use get_stock_quote
   - Technical analysis or indicators → use analyze_technical_indicators
   - Market overview or sentiment → use get_market_overview
   - Comparing multiple stocks → use compare_stocks
   - Stock news or headlines → use get_stock_news
   - Position sizing or risk → use calculate_position_size
   - Portfolio information → use get_portfolio_summary

2. ALWAYS call the appropriate tools BEFORE providing analysis
3. Your responses will be enhanced with interactive smart components based on tool results
4. When multiple aspects are requested, use multiple tools to provide comprehensive data

Guidelines:
1. Use the available tools to provide accurate, real-time data
2. Always fetch current data when discussing specific stocks
3. Provide comprehensive analysis with actionable insights
4. Include risk warnings and educational context
5. Format responses clearly with bullet points and sections
6. Be proactive in suggesting related analysis or comparisons
7. Tool results will automatically generate visual components - focus on insights

Current context:
${financialContext}

Remember: You provide educational information only, not personalized financial advice.`
  }

  const allMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [systemMessage, ...messages]

  if (!stream) {
    // Non-streaming response with function calling
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: allMessages,
      tools: toolDefinitions,
      tool_choice: 'auto',
      temperature: 0.7
    })

    const message = completion.choices[0].message
    let finalContent = message.content || ''
    const toolCalls = message.tool_calls || []

    // Execute tool calls if any
    let toolResults: Array<{ role: 'tool', tool_call_id: string, content: string }> = []
    if (toolCalls.length > 0) {
      toolResults = await Promise.all(
        toolCalls.map(async (toolCall) => {
          const result = await executeToolCall(toolCall as ToolCall)
          return {
            role: 'tool' as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify(result)
          }
        })
      )

      // Get final response with tool results
      const finalCompletion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [...allMessages, message, ...toolResults],
        temperature: 0.7
      })

      finalContent = finalCompletion.choices[0].message.content || ''
    }

    // Parse response for smart components
    const parser = ResponseParser.getInstance()
    const parsedToolResults = toolCalls.map((tc, idx) => {
      try {
        return JSON.parse(toolResults[idx].content)
      } catch {
        return null
      }
    }).filter(Boolean)
    
    const { text, components, context } = parser.parseResponse(finalContent, parsedToolResults)

    return NextResponse.json({
      content: text,
      components,
      context,
      metadata: {
        ...extractMetadata(finalContent),
        toolResults: toolCalls?.length > 0 ? parsedToolResults : undefined
      }
    })
  }

  // Streaming response with function calling
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: allMessages,
          tools: toolDefinitions,
          tool_choice: 'auto',
          stream: true,
          temperature: 0.7
        })

        interface ToolCall {
          id: string
          type: 'function'
          function: {
            name: string
            arguments: string
          }
        }
        
        const toolCalls: ToolCall[] = []
        let currentToolCall: ToolCall | null = null

        for await (const chunk of completion) {
          const delta = chunk.choices[0].delta

          // Handle content
          if (delta.content) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: delta.content })}\n\n`)
            )
          }

          // Handle tool calls
          if (delta.tool_calls) {
            for (const toolCallDelta of delta.tool_calls) {
              if (toolCallDelta.id) {
                // New tool call
                if (currentToolCall) {
                  toolCalls.push(currentToolCall)
                }
                currentToolCall = {
                  id: toolCallDelta.id,
                  type: 'function',
                  function: {
                    name: toolCallDelta.function?.name || '',
                    arguments: toolCallDelta.function?.arguments || ''
                  }
                }
              } else if (currentToolCall && toolCallDelta.function?.arguments) {
                // Accumulate arguments
                currentToolCall.function.arguments += toolCallDelta.function.arguments
              }
            }
          }
        }

        // Add last tool call if any
        if (currentToolCall) {
          toolCalls.push(currentToolCall)
        }

        // Execute tool calls if any
        if (toolCalls.length > 0) {
          // Send a status update
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              status: 'Fetching real-time data...',
              toolCalls: toolCalls.map(tc => tc.function.name)
            })}\n\n`)
          )

          const toolResults = await Promise.all(
            toolCalls.map(async (toolCall) => {
              const result = await executeToolCall(toolCall)
              return {
                role: 'tool' as const,
                tool_call_id: toolCall.id,
                content: JSON.stringify(result)
              }
            })
          )

          // Parse tool results into components immediately
          const parser = ResponseParser.getInstance()
          const parsedToolResults = toolResults.map(tr => {
            try {
              return JSON.parse(tr.content)
            } catch {
              return null
            }
          }).filter(Boolean)
          
          // Send components from tool results immediately
          const toolComponents: SmartComponent[] = []
          parsedToolResults.forEach((result) => {
            const { components } = parser.parseResponse('', [result])
            if (components.length > 0) {
              toolComponents.push(...components)
            }
          })
          
          if (toolComponents.length > 0) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                components: toolComponents,
                layout: toolComponents.length > 1 ? 'grid' : 'inline'
              })}\n\n`)
            )
          }

          // Get final response with tool results
          const finalMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            ...allMessages,
            { role: 'assistant' as const, tool_calls: toolCalls },
            ...toolResults
          ]

          const finalCompletion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: finalMessages,
            stream: true,
            temperature: 0.7
          })

          // Stream the text response
          for await (const chunk of finalCompletion) {
            if (chunk.choices[0].delta.content) {
              const content = chunk.choices[0].delta.content
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ 
                  content: content 
                })}\n\n`)
              )
            }
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })

  return new NextResponse(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

async function handleRegularChat(messages: OpenAI.Chat.ChatCompletionMessageParam[], stream: boolean, provider?: string, locale: string = 'en') {
  // Validate API keys
  if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'No AI provider API key configured' },
      { status: 500 }
    )
  }

  const aiFactory = AIProviderFactory.getInstance()
  const aiProvider = aiFactory.getProvider(provider)

  // Build financial context
  const lastMessage = messages[messages.length - 1]
  const content = typeof lastMessage.content === 'string' ? lastMessage.content : ''
  const financialContext = await buildFinancialContext(content)

  // Language instructions based on locale
  const languageInstruction = locale === 'ar' 
    ? 'You MUST respond in Arabic (العربية). All your responses, analysis, and explanations must be in Arabic. However, keep stock symbols (like AAPL, MSFT) and currency symbols ($) in English.'
    : 'Respond in English.'

  // Create system prompt
  const systemMessage: OpenAI.Chat.ChatCompletionSystemMessageParam = {
    role: 'system' as const,
    content: `You are FinChat, an expert financial AI assistant specialized in stock market analysis, investment strategies, and financial planning.

${languageInstruction} 

Guidelines:
1. Provide accurate, data-driven insights
2. Always mention when data might be delayed or estimated
3. Include relevant disclaimers about investment risks
4. Be educational and help users understand complex concepts
5. Use financial data when available to support your analysis
6. Format responses with clear sections and bullet points when appropriate

Current market context:
${financialContext}

Remember: You provide educational information only, not personalized financial advice.`
  }

  const allMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [systemMessage, ...messages]

  if (!stream) {
    const lastMessageContent = allMessages[allMessages.length - 1].content
    const prompt = typeof lastMessageContent === 'string' ? lastMessageContent : ''
    const response = await aiProvider.generateCompletion(prompt, 'text')

    return NextResponse.json({ 
      content: response,
      metadata: extractMetadata(response)
    })
  }

  // Streaming response (existing implementation)
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        const prompt = allMessages
          .map(msg => {
            const content = typeof msg.content === 'string' ? msg.content : ''
            return `${msg.role}: ${content}`
          })
          .join('\n\n')
        const fullResponse = await aiProvider.generateCompletion(prompt, 'text')
        const metadata = extractMetadata(fullResponse)
        const words = fullResponse.split(' ')

        for (let i = 0; i < words.length; i++) {
          const chunk = {
            content: (i > 0 ? ' ' : '') + words[i],
            metadata: i === words.length - 1 ? metadata : undefined
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
          )

          await new Promise(resolve => setTimeout(resolve, 30))
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })

  return new NextResponse(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// Helper function to build financial context
async function buildFinancialContext(userMessage: string): Promise<string> {
  const context: string[] = []
  
  // Extract stock symbols from message
  const stockSymbols = extractStockSymbols(userMessage)
  
  if (stockSymbols.length > 0 && process.env.FINNHUB_API_KEY) {
    try {
      const finnhub = new FinnhubClient(process.env.FINNHUB_API_KEY!)
      
      for (const symbol of stockSymbols.slice(0, 3)) { // Limit to 3 stocks
        try {
          const quote = await finnhub.getQuote(symbol)
          context.push(
            `${symbol}: $${quote.c} (${quote.dp > 0 ? '+' : ''}${quote.dp}%)`
          )
        } catch (err) {
          console.error(`Error fetching ${symbol}:`, err)
        }
      }
    } catch (err) {
      console.error('Error building financial context:', err)
    }
  }

  // Add market status
  const now = new Date()
  const hour = now.getUTCHours()
  const day = now.getUTCDay()
  const isMarketHours = day >= 1 && day <= 5 && hour >= 13 && hour <= 20 // Rough EST market hours
  
  context.push(`Market Status: ${isMarketHours ? 'Open' : 'Closed'}`)
  context.push(`Date: ${now.toDateString()}`)

  return context.join('\n')
}

// Extract stock symbols from text
function extractStockSymbols(text: string): string[] {
  // Match stock symbols in various formats:
  // $AAPL, AAPL:, (AAPL), [AAPL], "AAPL", 'AAPL', or just AAPL
  const patterns = [
    /\$([A-Z]{1,5})\b/g,           // $AAPL
    /\b([A-Z]{1,5}):/g,            // AAPL:
    /\(([A-Z]{1,5})\)/g,           // (AAPL)
    /\[([A-Z]{1,5})\]/g,           // [AAPL]
    /"([A-Z]{1,5})"/g,             // "AAPL"
    /'([A-Z]{1,5})'/g,             // 'AAPL'
    /\b([A-Z]{2,5})\b/g            // Just AAPL (2-5 chars to avoid single letters)
  ]
  
  const matches = new Set<string>()
  
  patterns.forEach(pattern => {
    const found = [...text.matchAll(pattern)]
    found.forEach(match => {
      if (match[1]) matches.add(match[1])
      else if (match[0]) matches.add(match[0].replace(/[$:()[\]"']/g, ''))
    })
  })
  
  // Extended list of common stock symbols
  const commonStocks = new Set([
    'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD', 'INTC', 
    'IBM', 'ORCL', 'CSCO', 'CRM', 'ADBE', 'NFLX', 'PYPL', 'DIS', 'V', 'MA', 
    'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'AXP', 'WMT', 'HD', 'NKE', 
    'MCD', 'KO', 'PEP', 'PG', 'JNJ', 'UNH', 'PFE', 'ABBV', 'MRK', 'TMO',
    'BA', 'CAT', 'GE', 'MMM', 'HON', 'LMT', 'RTX', 'T', 'VZ', 'CMCSA',
    'SPY', 'QQQ', 'DIA', 'IWM', 'VTI', 'VOO', 'BRK', 'BRKB', 'XOM', 'CVX',
    'COIN', 'SQ', 'SHOP', 'ROKU', 'UBER', 'LYFT', 'SNAP', 'PINS', 'TWTR',
    'F', 'GM', 'RIVN', 'LCID', 'NIO', 'XPEV', 'LI', 'FSR', 'RIDE'
  ])
  
  // Common words that might be mistaken for tickers
  const excludeWords = new Set([
    'AI', 'CEO', 'CFO', 'IPO', 'ETF', 'PE', 'EPS', 'ROI', 'ROE', 'API',
    'USA', 'US', 'UK', 'EU', 'GDP', 'CPI', 'FED', 'SEC', 'NYSE', 'NASDAQ'
  ])
  
  return Array.from(matches)
    .filter(match => {
      // Must be 2-5 uppercase letters
      if (!/^[A-Z]{2,5}$/.test(match)) return false
      
      // Exclude common non-ticker acronyms
      if (excludeWords.has(match)) return false
      
      // Include if it's a known stock or looks like a ticker
      return commonStocks.has(match) || match.length >= 2
    })
    .slice(0, 5) // Limit to 5 stocks per message
}

// Extract metadata from response
interface ChatMetadata {
  stocks?: string[]
}

function extractMetadata(response: string): ChatMetadata | undefined {
  const metadata: ChatMetadata = {}
  
  // Extract mentioned stock symbols
  const stocks = extractStockSymbols(response)
  if (stocks.length > 0) {
    // Remove duplicates and limit to 10 stocks
    metadata.stocks = [...new Set(stocks)].slice(0, 10)
  }
  
  return Object.keys(metadata).length > 0 ? metadata : undefined
}

// Format messages for completion
interface ChatMessage {
  role: string
  content: string
}

function formatMessagesForCompletion(messages: ChatMessage[]): string {
  return messages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n\n')
}