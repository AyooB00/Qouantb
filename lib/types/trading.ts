export interface SearchCriteria {
  priceRange: {
    min: number;
    max: number;
  };
  marketCapRange?: {
    min: number;
    max: number;
  };
  volumeRequirement?: number;
  sectors?: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  holdingPeriod: 'short' | 'medium' | 'long';
}

export interface StockData {
  symbol: string;
  companyName: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  sector?: string;
  technicalIndicators?: {
    rsi?: number;
    macd?: {
      macd: number;
      signal: number;
      histogram: number;
    };
    sma20?: number;
    sma50?: number;
    sma200?: number;
  };
}

export interface TradingOpportunity {
  symbol: string;
  companyName: string;
  currentPrice: number;
  entryPrice: number;
  entryPercentage: number;
  stopLoss: number;
  stopLossPercentage: number;
  takeProfit: {
    target1: number;
    target2: number;
    target3?: number;
  };
  takeProfitPercentages: {
    target1: number;
    target2: number;
    target3?: number;
  };
  confidence: number;
  reasoning: string;
  technicalAnalysis: string;
  riskRewardRatio: number;
}

export interface AnalysisResult {
  opportunities: TradingOpportunity[];
  timestamp: string;
  criteria: SearchCriteria;
  totalAnalyzed: number;
}

export interface FinnhubQuote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
}

export interface FinnhubCompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

export interface OpenAIAnalysisRequest {
  stockData: StockData[];
  criteria: SearchCriteria;
}

export interface OpenAIAnalysisResponse {
  opportunities: TradingOpportunity[];
}