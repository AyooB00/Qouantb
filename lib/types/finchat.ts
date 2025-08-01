export type SmartComponentType = 
  | 'market-analysis' 
  | 'stock-comparison' 
  | 'technical-analysis'
  | 'news-summary'
  | 'portfolio-impact'
  | 'risk-assessment'
  | 'price-alert'
  | 'earnings-summary'
  | 'sector-analysis'
  | 'sentiment-gauge'

export interface QuickAction {
  label: string
  action: string
  data?: Record<string, unknown>
  variant?: 'default' | 'primary' | 'secondary' | 'destructive'
  icon?: string
}

export interface MessageContext {
  intent: 'research' | 'trading' | 'learning' | 'monitoring' | 'analysis'
  topics: string[]
  symbols: string[]
  timeframe?: string
  riskLevel?: 'low' | 'medium' | 'high'
}

export interface SmartComponent {
  id: string
  type: SmartComponentType
  data: MarketAnalysisData | StockComparisonData | TechnicalAnalysisData | NewsSummaryData | PortfolioImpactData | RiskAssessmentData | Record<string, unknown>
  priority: number
  interactive: boolean
  metadata?: {
    source?: string
    timestamp?: string
    confidence?: number
  }
}

export interface MarketAnalysisData {
  sentiment: 'bullish' | 'bearish' | 'neutral'
  score: number
  indices: Array<{
    symbol: string
    name: string
    value: number
    change: number
    changePercent: number
  }>
  topMovers: {
    gainers: Array<{ symbol: string; changePercent: number }>
    losers: Array<{ symbol: string; changePercent: number }>
  }
  summary: string
}

export interface StockComparisonData {
  stocks: Array<{
    symbol: string
    name: string
    price: number
    changePercent: number
    volume: number
    marketCap: number
    pe?: number
    eps?: number
    dividendYield?: number
    beta?: number
    weekRange52?: { low: number; high: number }
  }>
  recommendation?: string
}

export interface TechnicalAnalysisData {
  symbol: string
  indicators: {
    rsi: { value: number; signal: 'oversold' | 'neutral' | 'overbought' }
    macd: { value: number; signal: number; histogram: number; trend: 'bullish' | 'bearish' }
    movingAverages: {
      sma20: number
      sma50: number
      sma200: number
    }
    bollingerBands?: {
      upper: number
      middle: number
      lower: number
      price: number
    }
  }
  support: number[]
  resistance: number[]
  trend: 'uptrend' | 'downtrend' | 'sideways'
  signal: 'strong-buy' | 'buy' | 'hold' | 'sell' | 'strong-sell'
}

export interface NewsSummaryData {
  articles: Array<{
    headline: string
    summary: string
    source: string
    url: string
    publishedAt: string
    sentiment?: 'positive' | 'negative' | 'neutral'
    relevanceScore?: number
  }>
  overallSentiment: 'positive' | 'negative' | 'mixed' | 'neutral'
  keyTopics: string[]
}

export interface PortfolioImpactData {
  symbol: string
  currentPosition?: {
    shares: number
    avgCost: number
    currentValue: number
    gainLoss: number
    gainLossPercent: number
  }
  proposedAction: {
    type: 'buy' | 'sell' | 'hold'
    shares?: number
    estimatedCost?: number
  }
  impact: {
    newAllocation: number
    diversificationScore: number
    riskChange: 'increase' | 'decrease' | 'neutral'
    projectedReturn?: number
  }
}

export interface RiskAssessmentData {
  symbol: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'very-high'
  factors: Array<{
    name: string
    impact: 'positive' | 'negative'
    weight: number
    description: string
  }>
  volatility: {
    daily: number
    weekly: number
    monthly: number
  }
  beta: number
  recommendation: string
}

export interface EnhancedChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  components?: SmartComponent[]
  context?: MessageContext
  actions?: QuickAction[]
  metadata?: {
    error?: boolean
    isThinking?: boolean
    toolStatus?: Record<string, unknown>
    processingTime?: number
  }
}

export interface ComponentRenderProps<T = unknown> {
  data: T
  onAction?: (action: QuickAction) => void
  className?: string
}

export interface StreamedComponentData {
  componentId: string
  type: SmartComponentType
  partial: boolean
  data: Partial<MarketAnalysisData | StockComparisonData | TechnicalAnalysisData | NewsSummaryData | PortfolioImpactData | RiskAssessmentData> | Record<string, unknown>
}