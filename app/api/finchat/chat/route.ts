import { NextRequest, NextResponse } from 'next/server'
import { AIProviderFactory } from '@/lib/ai-providers/provider-factory'
import { FinnhubClient } from '@/lib/finnhub'

export async function POST(request: NextRequest) {
  try {
    const { messages, stream = true } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Validate API keys
    if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'No AI provider API key configured' },
        { status: 500 }
      )
    }

    const aiFactory = AIProviderFactory.getInstance()
    const provider = aiFactory.getProvider()

    // Build financial context
    const financialContext = await buildFinancialContext(messages[messages.length - 1].content)

    // Create system prompt with financial expertise
    const systemMessage = {
      role: 'system',
      content: `You are FinChat, an expert financial AI assistant specialized in stock market analysis, investment strategies, and financial planning. 

Your capabilities include:
- Real-time market analysis and stock evaluation
- Technical and fundamental analysis
- Investment strategy recommendations
- Risk assessment and portfolio optimization
- Economic indicator interpretation
- Options and derivatives strategies

Guidelines:
1. Provide accurate, data-driven insights
2. Always mention when data might be delayed or estimated
3. Include relevant disclaimers about investment risks
4. Be educational and help users understand complex concepts
5. Use financial data when available to support your analysis
6. Format responses with clear sections and bullet points when appropriate
7. If mentioning specific stocks, include their current price and performance when possible

Current market context:
${financialContext}

Remember: You provide educational information only, not personalized financial advice.`
    }

    const allMessages = [systemMessage, ...messages]

    if (!stream) {
      // Non-streaming response
      const prompt = allMessages[allMessages.length - 1].content
      const response = await provider.generateCompletion(prompt, 'text')

      return NextResponse.json({ 
        content: response,
        metadata: extractMetadata(response)
      })
    }

    // Streaming response
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // For now, we'll simulate streaming by breaking the response into chunks
          // In production, you'd use the actual streaming API from OpenAI/Gemini
          const prompt = formatMessagesForCompletion(allMessages)
          const fullResponse = await provider.generateCompletion(prompt, 'text')

          // Extract metadata
          const metadata = extractMetadata(fullResponse)

          // Simulate streaming by sending chunks
          const words = fullResponse.split(' ')
          let accumulated = ''

          for (let i = 0; i < words.length; i++) {
            accumulated += (i > 0 ? ' ' : '') + words[i]
            
            const chunk = {
              content: (i > 0 ? ' ' : '') + words[i],
              metadata: i === words.length - 1 ? metadata : undefined
            }

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
            )

            // Small delay to simulate streaming
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

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat request' },
      { status: 500 }
    )
  }
}

// Helper function to build financial context
async function buildFinancialContext(userMessage: string): Promise<string> {
  const context: string[] = []
  
  // Extract stock symbols from message
  const stockSymbols = extractStockSymbols(userMessage)
  
  if (stockSymbols.length > 0 && process.env.FINNHUB_API_KEY) {
    try {
      const finnhub = new FinnhubClient(process.env.FINNHUB_API_KEY)
      
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
  // Match stock symbols (1-5 uppercase letters)
  const matches = text.match(/\b[A-Z]{1,5}\b/g) || []
  
  // Filter to likely stock symbols
  const commonStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD', 'INTC', 'IBM']
  return matches.filter(match => 
    commonStocks.includes(match) || 
    (match.length >= 2 && match.length <= 4) // Most stocks are 2-4 letters
  )
}

// Extract metadata from response
function extractMetadata(response: string): any {
  const metadata: any = {}
  
  // Extract mentioned stock symbols
  const stocks = extractStockSymbols(response)
  if (stocks.length > 0) {
    metadata.stocks = [...new Set(stocks)] // Remove duplicates
  }
  
  return Object.keys(metadata).length > 0 ? metadata : undefined
}

// Format messages for completion
function formatMessagesForCompletion(messages: any[]): string {
  return messages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n\n')
}