import { NextRequest, NextResponse } from 'next/server'
import { FinnhubClient } from '@/lib/finnhub'
import { AIProviderFactory } from '@/lib/ai-providers/provider-factory'
import { DailyPortfolioInsights, PortfolioInsight } from '@/lib/types/portfolio'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'

export async function GET(request: NextRequest) {
  try {
    // Validate API keys
    if (!process.env.FINNHUB_API_KEY || !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'API keys not configured' },
        { status: 500 }
      )
    }

    // Note: In a real implementation, we'd get the portfolio from the user's session
    // For now, we'll analyze the default portfolio
    const mockPortfolioData = {
      items: [
        { symbol: 'AAPL', currentPrice: 185.25, dayChangePercent: 1.2, value: 9262.50 },
        { symbol: 'MSFT', currentPrice: 415.50, dayChangePercent: -0.8, value: 10387.50 },
        { symbol: 'TSLA', currentPrice: 235.75, dayChangePercent: -3.5, value: 3536.25 }
      ],
      totalValue: 23186.25,
      dailyChange: 0.8
    }

    const aiFactory = AIProviderFactory.getInstance()
    const provider = aiFactory.getProvider()

    // Generate market summary
    const marketSummaryPrompt = `
      Provide a brief market summary for today focusing on tech stocks.
      Keep it to 2-3 sentences. Be specific about market trends.
      Return as plain text.
    `

    const marketSummary = await provider.generateCompletion(marketSummaryPrompt)

    // Generate portfolio insights
    const insightsPrompt = `
      Analyze this portfolio and provide 3-5 actionable insights:
      ${JSON.stringify(mockPortfolioData.items)}
      
      Focus on:
      1. Performance anomalies or opportunities
      2. Risk factors to watch
      3. Rebalancing suggestions
      4. Market news impact
      
      Return JSON array of insights:
      [{
        "type": "performance|risk|opportunity|rebalancing|news",
        "title": "Brief title",
        "description": "Detailed explanation",
        "impact": "positive|negative|neutral",
        "priority": "high|medium|low",
        "actionable": true/false,
        "suggestedAction": "Optional specific action",
        "relatedSymbols": ["SYMBOL1", "SYMBOL2"]
      }]
    `

    const insightsResponse = await provider.generateCompletion(insightsPrompt, 'json_object')
    const insights: PortfolioInsight[] = JSON.parse(insightsResponse).insights || []

    // Calculate performance attribution
    const topMovers = mockPortfolioData.items
      .sort((a, b) => Math.abs(b.dayChangePercent) - Math.abs(a.dayChangePercent))
      .slice(0, 3)
      .map(item => ({
        symbol: item.symbol,
        change: item.dayChangePercent,
        reason: item.dayChangePercent > 0 ? 'Strong earnings outlook' : 'Market volatility'
      }))

    // Generate tomorrow's watchlist
    const watchlistPrompt = `
      Based on this portfolio, suggest 2-3 stocks to watch tomorrow:
      ${JSON.stringify(mockPortfolioData.items.map(i => i.symbol))}
      
      Return JSON:
      {
        "watchlist": [
          {
            "symbol": "SYMBOL",
            "reason": "Why to watch",
            "expectedImpact": "What might happen"
          }
        ]
      }
    `

    const watchlistResponse = await provider.generateCompletion(watchlistPrompt, 'json_object')
    const watchlistData = JSON.parse(watchlistResponse)

    const response: DailyPortfolioInsights = {
      date: new Date().toISOString(),
      marketSummary,
      topMovers,
      insights,
      performanceAnalysis: {
        dailyReturn: mockPortfolioData.dailyChange,
        vsMarket: mockPortfolioData.dailyChange - 0.5, // Mock S&P 500 comparison
        attribution: mockPortfolioData.items.map(item => ({
          symbol: item.symbol,
          contribution: (item.value / mockPortfolioData.totalValue) * item.dayChangePercent
        }))
      },
      tomorrowWatchlist: watchlistData.watchlist || []
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error generating portfolio insights:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate portfolio insights' },
      { status: 500 }
    )
  }
}