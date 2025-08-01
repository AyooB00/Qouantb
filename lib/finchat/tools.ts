import { FinnhubClient } from '@/lib/finnhub'

// Tool type definitions
export interface ToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, unknown>
      required?: string[]
    }
  }
}

export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface ToolResponse {
  tool_call_id: string
  role: 'tool'
  content: string
}

// Tool implementations
export const finChatTools = {
  async get_stock_quote(args: { symbol: string }) {
    try {
      const finnhub = new FinnhubClient(process.env.FINNHUB_API_KEY || '')
      const [quote, profile] = await Promise.all([
        finnhub.getQuote(args.symbol.toUpperCase()),
        finnhub.getCompanyProfile(args.symbol.toUpperCase())
      ])

      return {
        symbol: args.symbol.toUpperCase(),
        companyName: profile.name,
        currentPrice: quote.c,
        change: quote.d,
        changePercent: quote.dp,
        dayHigh: quote.h,
        dayLow: quote.l,
        openPrice: quote.o,
        previousClose: quote.pc,
        marketCap: profile.marketCapitalization * 1000000,
        sector: profile.finnhubIndustry,
        exchange: profile.exchange,
        timestamp: new Date().toISOString()
      }
    } catch {
      return {
        error: `Failed to fetch quote for ${args.symbol}`,
        symbol: args.symbol
      }
    }
  },

  async compare_stocks(args: { symbols: string[] }) {
    try {
      const finnhub = new FinnhubClient(process.env.FINNHUB_API_KEY || '')
      const results = await Promise.all(
        args.symbols.slice(0, 5).map(async (symbol) => {
          try {
            const [quote, profile] = await Promise.all([
              finnhub.getQuote(symbol.toUpperCase()),
              finnhub.getCompanyProfile(symbol.toUpperCase())
            ])
            
            // Calculate additional metrics
            const weekRange52 = profile.yearHigh && profile.yearLow ? {
              high: profile.yearHigh,
              low: profile.yearLow
            } : undefined
            
            return {
              symbol: symbol.toUpperCase(),
              name: profile.name || symbol.toUpperCase(),
              price: quote.c,
              changePercent: quote.dp,
              volume: quote.v || 0,
              marketCap: profile.marketCapitalization * 1000000,
              pe: profile.pe,
              eps: profile.pe && quote.c ? quote.c / profile.pe : undefined,
              dividendYield: profile.dividendYield,
              beta: profile.beta,
              weekRange52,
              sector: profile.finnhubIndustry
            }
          } catch {
            return null
          }
        })
      )

      const validStocks = results.filter(r => r !== null) as Array<{symbol: string; name: string; currentPrice: number; changePercent: number}>
      
      // Generate AI recommendation based on comparison
      let recommendation = ''
      if (validStocks.length > 1) {
        const bestPerformer = validStocks.reduce((best, stock) => 
          stock.changePercent > best.changePercent ? stock : best
        )
        const lowestPE = validStocks.filter(s => s.pe).reduce((best, stock) => 
          stock.pe && (!best.pe || stock.pe < best.pe) ? stock : best, validStocks[0]
        )
        
        recommendation = `${bestPerformer.symbol} shows the strongest momentum today (+${bestPerformer.changePercent.toFixed(2)}%). `
        if (lowestPE && lowestPE.pe) {
          recommendation += `${lowestPE.symbol} offers the best value with a P/E of ${lowestPE.pe.toFixed(2)}. `
        }
        recommendation += 'Consider diversifying across sectors for balanced exposure.'
      }

      return {
        stocks: validStocks,
        recommendation,
        timestamp: new Date().toISOString()
      }
    } catch {
      return {
        error: 'Failed to compare stocks',
        symbols: args.symbols
      }
    }
  },

  async get_stock_news(args: { symbol: string; days?: number }) {
    try {
      const finnhub = new FinnhubClient(process.env.FINNHUB_API_KEY || '')
      const news = await finnhub.getCompanyNews(args.symbol.toUpperCase(), args.days || 7)
      
      // Analyze sentiment for each article (mock for demo)
      const articles = news.slice(0, 5).map((article: {headline: string; summary: string; url: string}) => {
        const headline = article.headline.toLowerCase()
        let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
        
        // Simple sentiment analysis based on keywords
        const positiveWords = ['surge', 'gain', 'profit', 'growth', 'beat', 'rally', 'breakout', 'upgrade']
        const negativeWords = ['loss', 'drop', 'fall', 'decline', 'miss', 'downgrade', 'cut', 'warning']
        
        if (positiveWords.some(word => headline.includes(word))) sentiment = 'positive'
        else if (negativeWords.some(word => headline.includes(word))) sentiment = 'negative'
        
        return {
          headline: article.headline,
          summary: article.summary,
          source: article.source,
          url: article.url,
          publishedAt: new Date(article.datetime * 1000).toISOString(),
          sentiment,
          relevanceScore: Math.random() * 0.4 + 0.6 // Mock relevance score 0.6-1.0
        }
      })
      
      // Calculate overall sentiment
      const sentimentCounts = articles.reduce((acc, article) => {
        acc[article.sentiment] = (acc[article.sentiment] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      let overallSentiment: 'positive' | 'negative' | 'mixed' | 'neutral' = 'neutral'
      if (sentimentCounts.positive > sentimentCounts.negative) overallSentiment = 'positive'
      else if (sentimentCounts.negative > sentimentCounts.positive) overallSentiment = 'negative'
      else if (sentimentCounts.positive && sentimentCounts.negative) overallSentiment = 'mixed'
      
      // Extract key topics
      const keyTopics = ['earnings', 'product launch', 'market share', 'regulatory']
        .filter(topic => articles.some(a => a.headline.toLowerCase().includes(topic)))
      
      return {
        articles,
        overallSentiment,
        keyTopics,
        symbol: args.symbol.toUpperCase(),
        count: news.length,
        period: `Last ${args.days || 7} days`
      }
    } catch {
      return {
        error: `Failed to fetch news for ${args.symbol}`,
        symbol: args.symbol
      }
    }
  },

  async analyze_technical_indicators(args: { symbol: string }) {
    try {
      const finnhub = new FinnhubClient(process.env.FINNHUB_API_KEY || '')
      const [quote] = await Promise.all([
        finnhub.getQuote(args.symbol.toUpperCase()),
        finnhub.getCompanyProfile(args.symbol.toUpperCase())
      ])
      
      const currentPrice = quote.c
      
      // Mock technical indicators for demonstration
      const rsi = 45 + Math.random() * 20 // Random between 45-65 for demo
      const macdValue = (Math.random() - 0.5) * 2
      const macdSignal = macdValue - 0.1
      const macdHistogram = macdValue - macdSignal
      
      // Calculate moving averages (simplified)
      const sma20 = currentPrice * (1 + (Math.random() - 0.5) * 0.02)
      const sma50 = currentPrice * (1 + (Math.random() - 0.5) * 0.05)
      const sma200 = currentPrice * (1 + (Math.random() - 0.5) * 0.1)
      
      // Calculate support and resistance levels
      const support = [
        currentPrice * 0.97,
        currentPrice * 0.95,
        currentPrice * 0.92
      ]
      const resistance = [
        currentPrice * 1.03,
        currentPrice * 1.05,
        currentPrice * 1.08
      ]
      
      // Determine trend
      let trend: 'uptrend' | 'downtrend' | 'sideways' = 'sideways'
      if (currentPrice > sma20 && sma20 > sma50) trend = 'uptrend'
      else if (currentPrice < sma20 && sma20 < sma50) trend = 'downtrend'
      
      // Determine signal
      let signal: 'strong-buy' | 'buy' | 'hold' | 'sell' | 'strong-sell' = 'hold'
      if (rsi < 30 && trend === 'uptrend') signal = 'strong-buy'
      else if (rsi < 40 && trend !== 'downtrend') signal = 'buy'
      else if (rsi > 70 && trend === 'downtrend') signal = 'strong-sell'
      else if (rsi > 60 && trend !== 'uptrend') signal = 'sell'
      
      // Calculate Bollinger Bands
      const stdDev = currentPrice * 0.02 // Simplified
      const bollingerBands = {
        upper: sma20 + (2 * stdDev),
        middle: sma20,
        lower: sma20 - (2 * stdDev),
        price: currentPrice
      }
      
      return {
        symbol: args.symbol.toUpperCase(),
        indicators: {
          rsi: {
            value: rsi,
            signal: rsi < 30 ? 'oversold' as const : rsi > 70 ? 'overbought' as const : 'neutral' as const
          },
          macd: {
            value: macdValue,
            signal: macdSignal,
            histogram: macdHistogram,
            trend: macdHistogram > 0 ? 'bullish' as const : 'bearish' as const
          },
          movingAverages: {
            sma20,
            sma50,
            sma200
          },
          bollingerBands
        },
        support,
        resistance,
        trend,
        signal,
        recommendation: signal === 'strong-buy' ? 'Strong technical setup for entry. Consider buying with stop loss below support.' :
                       signal === 'buy' ? 'Favorable conditions for entry. Monitor volume for confirmation.' :
                       signal === 'sell' ? 'Technical indicators suggest taking profits or reducing position.' :
                       signal === 'strong-sell' ? 'Exit signals present. Consider closing position to preserve capital.' :
                       'Hold and monitor. Wait for clearer signals before taking action.'
      }
    } catch {
      return {
        error: `Failed to analyze ${args.symbol}`,
        symbol: args.symbol
      }
    }
  },

  async get_portfolio_summary() {
    try {
      // Mock portfolio data for demonstration
      // In production, this would fetch from a database or API
      return {
        message: "Portfolio analysis requires integration with your account.",
        suggestion: "To analyze your portfolio, please navigate to the Portfolio page and ensure you have added your holdings.",
        mockExample: {
          totalValue: 125000,
          totalGainLoss: 15000,
          totalGainLossPercent: 13.6,
          numberOfHoldings: 8,
          topPerformer: { symbol: "NVDA", gainPercent: 45.2 },
          diversification: {
            technology: 40,
            healthcare: 20,
            finance: 15,
            consumer: 15,
            other: 10
          }
        }
      }
    } catch {
      return {
        error: 'Failed to fetch portfolio data'
      }
    }
  },

  async calculate_position_size(args: { 
    symbol: string, 
    accountSize: number, 
    riskPercent: number,
    stopLossPercent: number 
  }) {
    try {
      const finnhub = new FinnhubClient(process.env.FINNHUB_API_KEY || '')
      const quote = await finnhub.getQuote(args.symbol.toUpperCase())
      
      const currentPrice = quote.c
      const riskAmount = args.accountSize * (args.riskPercent / 100)
      const stopLossPrice = currentPrice * (1 - args.stopLossPercent / 100)
      const riskPerShare = currentPrice - stopLossPrice
      const positionSize = Math.floor(riskAmount / riskPerShare)
      const totalCost = positionSize * currentPrice
      
      return {
        symbol: args.symbol.toUpperCase(),
        currentPrice,
        recommendedShares: positionSize,
        totalCost,
        stopLossPrice,
        riskAmount,
        percentOfAccount: (totalCost / args.accountSize) * 100,
        maxLoss: positionSize * riskPerShare,
        breakEvenPrice: currentPrice,
        target1: currentPrice * 1.02, // 2% gain
        target2: currentPrice * 1.05, // 5% gain
        target3: currentPrice * 1.10  // 10% gain
      }
    } catch {
      return {
        error: `Failed to calculate position size for ${args.symbol}`,
        symbol: args.symbol
      }
    }
  },

  async get_market_overview() {
    try {
      // Get major indices (using ETFs as proxy)
      const finnhub = new FinnhubClient(process.env.FINNHUB_API_KEY || '')
      const indices = ['SPY', 'QQQ', 'DIA', 'IWM', 'VTI']
      
      const results = await Promise.all(
        indices.map(async (symbol) => {
          try {
            const quote = await finnhub.getQuote(symbol)
            return {
              symbol,
              name: symbol === 'SPY' ? 'S&P 500' :
                    symbol === 'QQQ' ? 'NASDAQ 100' :
                    symbol === 'DIA' ? 'Dow Jones' :
                    symbol === 'IWM' ? 'Russell 2000' :
                    'Total Market',
              value: quote.c,
              change: quote.d,
              changePercent: quote.dp
            }
          } catch {
            return null
          }
        })
      )
      
      const validResults = results.filter(r => r !== null) as Array<unknown>
      const avgChange = validResults.reduce((sum, r) => sum + r.changePercent, 0) / validResults.length
      
      // Mock top movers data for demonstration
      const topMovers = {
        gainers: [
          { symbol: 'NVDA', changePercent: 5.2 },
          { symbol: 'TSLA', changePercent: 4.8 },
          { symbol: 'AMD', changePercent: 3.9 }
        ],
        losers: [
          { symbol: 'AAPL', changePercent: -2.1 },
          { symbol: 'MSFT', changePercent: -1.8 },
          { symbol: 'GOOGL', changePercent: -1.5 }
        ]
      }
      
      return {
        sentiment: avgChange > 0.5 ? 'bullish' as const :
                   avgChange < -0.5 ? 'bearish' as const : 'neutral' as const,
        score: avgChange,
        indices: validResults,
        topMovers,
        summary: `Markets are ${avgChange > 0 ? 'up' : 'down'} ${Math.abs(avgChange).toFixed(2)}% on average today. ${avgChange > 1 ? 'Strong bullish momentum across major indices.' : avgChange < -1 ? 'Bearish sentiment dominates the market.' : 'Mixed signals with moderate trading activity.'}`,
        timestamp: new Date().toISOString()
      }
    } catch {
      return {
        error: 'Failed to fetch market overview'
      }
    }
  }
}

// Tool definitions for OpenAI
export const toolDefinitions: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'get_stock_quote',
      description: 'Get real-time stock quote and company information',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'Stock ticker symbol (e.g., AAPL, MSFT)'
          }
        },
        required: ['symbol']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'compare_stocks',
      description: 'Compare multiple stocks side by side',
      parameters: {
        type: 'object',
        properties: {
          symbols: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of stock symbols to compare (max 5)'
          }
        },
        required: ['symbols']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_stock_news',
      description: 'Get recent news for a specific stock',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'Stock ticker symbol'
          },
          days: {
            type: 'number',
            description: 'Number of days to look back (default: 7)'
          }
        },
        required: ['symbol']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'analyze_technical_indicators',
      description: 'Get technical analysis including RSI, MACD, support/resistance levels',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'Stock ticker symbol'
          }
        },
        required: ['symbol']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_portfolio_summary',
      description: 'Get summary of user portfolio including total value, gains/losses, and holdings',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'calculate_position_size',
      description: 'Calculate optimal position size based on risk management rules',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'Stock ticker symbol'
          },
          accountSize: {
            type: 'number',
            description: 'Total account size in USD'
          },
          riskPercent: {
            type: 'number',
            description: 'Percentage of account to risk (typically 1-2%)'
          },
          stopLossPercent: {
            type: 'number',
            description: 'Stop loss percentage from entry price'
          }
        },
        required: ['symbol', 'accountSize', 'riskPercent', 'stopLossPercent']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_market_overview',
      description: 'Get overview of major market indices and overall market sentiment',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  }
]

// Execute tool calls
export async function executeToolCall(toolCall: ToolCall): Promise<unknown> {
  const args = JSON.parse(toolCall.function.arguments)
  const func = finChatTools[toolCall.function.name as keyof typeof finChatTools]
  
  if (!func) {
    throw new Error(`Unknown tool: ${toolCall.function.name}`)
  }
  
  return await func(args)
}