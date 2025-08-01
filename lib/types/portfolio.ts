export interface PortfolioItem {
  id: string
  symbol: string
  companyName: string
  quantity: number
  avgCost: number
  addedDate: string
  lastUpdated: string
  currentPrice?: number
  totalValue?: number
  profitLoss?: number
  profitLossPercent?: number
  sector?: string
  industry?: string
  marketCap?: number
  beta?: number
  peRatio?: number
  dividendYield?: number
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekLow?: number
  dayChange?: number
  dayChangePercent?: number
  volume?: number
  avgVolume?: number
  lastAnalysis?: {
    timestamp: string
    tips: string[]
    forecast: {
      sevenDay: number
      thirtyDay: number
      confidence: number
    }
    sentiment: 'bullish' | 'bearish' | 'neutral'
    technicalIndicators?: {
      rsi: number
      sma50: number
      sma200: number
      support: number
      resistance: number
    }
  }
}

export interface PortfolioAnalysisRequest {
  symbols: string[]
}

export interface StockTip {
  type: 'buy' | 'sell' | 'hold' | 'warning' | 'opportunity'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

export interface StockForecast {
  symbol: string
  currentPrice: number
  predictions: {
    sevenDay: {
      price: number
      change: number
      changePercent: number
      confidence: number
    }
    thirtyDay: {
      price: number
      change: number
      changePercent: number
      confidence: number
    }
  }
  technicalIndicators: {
    trend: 'bullish' | 'bearish' | 'neutral'
    momentum: 'strong' | 'moderate' | 'weak'
    volatility: 'high' | 'medium' | 'low'
  }
  aiInsights: string
}

export interface PortfolioAnalysis {
  symbol: string
  companyName: string
  currentPrice: number
  tips: StockTip[]
  forecast: StockForecast
  lastUpdated: string
}

export interface PortfolioAnalysisResponse {
  analyses: PortfolioAnalysis[]
  portfolioInsights: {
    overallHealth: 'excellent' | 'good' | 'fair' | 'poor'
    diversificationScore: number
    riskLevel: 'low' | 'medium' | 'high'
    recommendations: string[]
  }
  timestamp: string
}

// Enhanced portfolio metrics
export interface PortfolioMetrics {
  sharpeRatio: number
  beta: number
  alpha: number
  volatility: number
  maxDrawdown: number
  diversificationScore: number
  riskScore: 'low' | 'medium' | 'high'
  sectorAllocation: Record<string, number>
  marketCapAllocation: {
    large: number
    mid: number
    small: number
  }
}

export interface PortfolioInsight {
  type: 'performance' | 'risk' | 'opportunity' | 'rebalancing' | 'news'
  title: string
  description: string
  impact: 'positive' | 'negative' | 'neutral'
  priority: 'high' | 'medium' | 'low'
  actionable: boolean
  suggestedAction?: string
  relatedSymbols?: string[]
}

export interface DailyPortfolioInsights {
  date: string
  marketSummary: string
  topMovers: {
    symbol: string
    change: number
    reason: string
  }[]
  insights: PortfolioInsight[]
  performanceAnalysis: {
    dailyReturn: number
    vsMarket: number
    attribution: {
      symbol: string
      contribution: number
    }[]
  }
  tomorrowWatchlist: {
    symbol: string
    reason: string
    expectedImpact: string
  }[]
}