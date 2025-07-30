import { StockData } from './trading';

export type AgentId = 'buffett' | 'cathie-wood' | 'lynch' | 'dalio' | 'graham';

export interface AgentPersona {
  id: AgentId;
  name: string;
  fullName: string;
  avatar?: string;
  philosophy: string;
  focusAreas: string[];
  keyMetrics: string[];
  timeHorizon: 'short' | 'medium' | 'long' | 'very-long';
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  investmentStyle: string;
}

export interface AgentAnalysis {
  agentId: AgentId;
  agentName: string;
  symbol: string;
  recommendation: 'strong-buy' | 'buy' | 'hold' | 'sell' | 'strong-sell';
  confidence: number; // 0-100
  reasoning: string;
  keyFactors: string[];
  risks: string[];
  opportunities: string[];
  timeHorizon: string;
  targetPrice?: number;
  entryStrategy?: string;
  exitStrategy?: string;
  notableQuote?: string;
}

export interface StockAnalysisRequest {
  symbol: string;
  agentIds: AgentId[];
}

export interface StockAnalysisResponse {
  symbol: string;
  companyName: string;
  currentPrice: number;
  stockData: StockData;
  analyses: AgentAnalysis[];
  timestamp: string;
}

export interface ExtendedStockData extends StockData {
  peRatio?: number;
  pegRatio?: number;
  priceToBook?: number;
  debtToEquity?: number;
  roe?: number; // Return on Equity
  revenueGrowth?: number;
  earningsGrowth?: number;
  profitMargin?: number;
  freeCashFlow?: number;
  dividendYield?: number;
  beta?: number;
  institutionalOwnership?: number;
  insiderOwnership?: number;
  shortInterest?: number;
  analystRating?: {
    consensus: string;
    targetPrice: number;
    numberOfAnalysts: number;
  };
  news?: {
    title: string;
    summary: string;
    url: string;
    publishedAt: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
  }[];
}