import { NextRequest, NextResponse } from 'next/server'
import { FinnhubClient } from '@/lib/finnhub'
import { AIProviderFactory } from '@/lib/ai-providers/provider-factory'
import { 
  PortfolioAnalysisRequest, 
  PortfolioAnalysisResponse, 
  PortfolioAnalysis,
  StockTip,
  StockForecast 
} from '@/lib/types/portfolio'
import { handleAPIError, validateAPIKeys, validateRequired, APIError } from '@/lib/api/error-handler'

export async function POST(request: NextRequest) {
  try {
    const body: PortfolioAnalysisRequest = await request.json()
    const { symbols } = body

    validateRequired(body, ['symbols'])
    if (!symbols || symbols.length === 0) {
      throw new APIError('No symbols provided', 400, 'NO_SYMBOLS')
    }

    // Validate API keys
    validateAPIKeys(['FINNHUB_API_KEY', 'OPENAI_API_KEY'])

    const finnhub = new FinnhubClient(process.env.FINNHUB_API_KEY)
    const aiFactory = AIProviderFactory.getInstance()
    const provider = aiFactory.getProvider()

    // Fetch current data for all symbols
    const stockDataPromises = symbols.map(async (symbol) => {
      await new Promise(resolve => setTimeout(resolve, 200)) // Rate limiting
      return finnhub.getExtendedStockData(symbol)
    })

    const stockDataArray = await Promise.all(stockDataPromises)

    // Generate analysis for each stock
    const analyses: PortfolioAnalysis[] = await Promise.all(
      stockDataArray.map(async (stockData, index) => {
        const symbol = symbols[index]
        
        // Generate AI-powered tips
        const tipsPrompt = `
          Analyze ${stockData.companyName} (${symbol}) and provide 3-5 actionable tips for an investor holding this stock.
          
          Current data:
          - Price: $${stockData.currentPrice}
          - Change: ${stockData.changePercent}%
          - P/E Ratio: ${stockData.peRatio || 'N/A'}
          - Market Cap: ${stockData.marketCap ? `$${(stockData.marketCap / 1e9).toFixed(2)}B` : 'N/A'}
          - Sector: ${stockData.sector || 'N/A'}
          
          Return JSON: {
            "tips": [
              {
                "type": "buy|sell|hold|warning|opportunity",
                "title": "Short actionable title",
                "description": "Detailed explanation",
                "priority": "high|medium|low"
              }
            ]
          }
        `

        // Generate forecast
        const forecastPrompt = `
          Provide a price forecast for ${stockData.companyName} (${symbol}).
          
          Current price: $${stockData.currentPrice}
          Recent performance: ${stockData.changePercent}% change
          
          Consider technical indicators, market trends, and company fundamentals.
          
          Return JSON: {
            "predictions": {
              "sevenDay": {
                "price": number,
                "change": number,
                "changePercent": number,
                "confidence": number (0-100)
              },
              "thirtyDay": {
                "price": number,
                "change": number,
                "changePercent": number,
                "confidence": number (0-100)
              }
            },
            "technicalIndicators": {
              "trend": "bullish|bearish|neutral",
              "momentum": "strong|moderate|weak",
              "volatility": "high|medium|low"
            },
            "aiInsights": "Brief analysis of the forecast"
          }
        `

        try {
          // Get tips
          const tipsResponse = await provider.generateCompletion(tipsPrompt, 'json_object')
          const tipsData = JSON.parse(tipsResponse)
          
          // Get forecast
          const forecastResponse = await provider.generateCompletion(forecastPrompt, 'json_object')
          const forecastData = JSON.parse(forecastResponse)

          const analysis: PortfolioAnalysis = {
            symbol,
            companyName: stockData.companyName,
            currentPrice: stockData.currentPrice,
            tips: tipsData.tips as StockTip[],
            forecast: {
              symbol,
              currentPrice: stockData.currentPrice,
              ...forecastData
            } as StockForecast,
            lastUpdated: new Date().toISOString()
          }

          return analysis
        } catch (error) {
          console.error(`Error analyzing ${symbol}:`, error)
          
          // Return basic analysis on error
          return {
            symbol,
            companyName: stockData.companyName,
            currentPrice: stockData.currentPrice,
            tips: [{
              type: 'hold' as const,
              title: 'Analysis Unavailable',
              description: 'Unable to generate AI analysis at this time',
              priority: 'medium' as const
            }],
            forecast: {
              symbol,
              currentPrice: stockData.currentPrice,
              predictions: {
                sevenDay: {
                  price: stockData.currentPrice,
                  change: 0,
                  changePercent: 0,
                  confidence: 0
                },
                thirtyDay: {
                  price: stockData.currentPrice,
                  change: 0,
                  changePercent: 0,
                  confidence: 0
                }
              },
              technicalIndicators: {
                trend: 'neutral' as const,
                momentum: 'moderate' as const,
                volatility: 'medium' as const
              },
              aiInsights: 'Analysis temporarily unavailable'
            },
            lastUpdated: new Date().toISOString()
          }
        }
      })
    )

    // Generate portfolio-level insights
    const portfolioInsightsPrompt = `
      Analyze this stock portfolio and provide overall insights:
      
      Stocks: ${analyses.map(a => `${a.symbol} (${a.companyName})`).join(', ')}
      
      Provide:
      1. Overall portfolio health assessment
      2. Diversification score (0-100)
      3. Risk level assessment
      4. 3-4 portfolio-level recommendations
      
      Return JSON: {
        "overallHealth": "excellent|good|fair|poor",
        "diversificationScore": number,
        "riskLevel": "low|medium|high",
        "recommendations": ["recommendation 1", "recommendation 2", ...]
      }
    `

    let portfolioInsights
    try {
      const insightsResponse = await provider.generateCompletion(portfolioInsightsPrompt, 'json_object')
      portfolioInsights = JSON.parse(insightsResponse)
    } catch (error) {
      console.error('Error generating portfolio insights:', error)
      portfolioInsights = {
        overallHealth: 'good',
        diversificationScore: 70,
        riskLevel: 'medium',
        recommendations: [
          'Consider diversifying across more sectors',
          'Monitor market volatility closely',
          'Review portfolio allocation quarterly'
        ]
      }
    }

    const response: PortfolioAnalysisResponse = {
      analyses,
      portfolioInsights,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    return handleAPIError(error)
  }
}