import { SearchCriteria, StockData, TradingOpportunity } from '@/lib/types/trading';

// Common interface for all AI providers
export interface AIProvider {
  name: string;
  parsePrompt(prompt: string): Promise<SearchCriteria>;
  analyzeStocks(stocks: StockData[], criteria: SearchCriteria): Promise<TradingOpportunity[]>;
}

// Configuration for AI providers
export interface AIProviderConfig {
  provider: 'openai' | 'gemini' | 'grok';
  apiKey: string;
  model?: string;
  fallbackProvider?: 'openai' | 'gemini' | 'grok';
}

// Response types
export interface PromptParseResult {
  success: boolean;
  criteria?: SearchCriteria;
  error?: string;
}

export interface StockAnalysisResult {
  success: boolean;
  opportunities?: TradingOpportunity[];
  error?: string;
}

// Base class for AI providers
export abstract class BaseAIProvider implements AIProvider {
  abstract name: string;
  protected apiKey: string;
  protected model?: string;

  constructor(apiKey: string, model?: string) {
    if (!apiKey) {
      throw new Error(`API key required for AI provider`);
    }
    this.apiKey = apiKey;
    this.model = model;
  }

  abstract parsePrompt(prompt: string): Promise<SearchCriteria>;
  abstract analyzeStocks(stocks: StockData[], criteria: SearchCriteria): Promise<TradingOpportunity[]>;

  // Common validation method
  protected validateTradingOpportunity(opportunity: TradingOpportunity): boolean {
    const entryDiff = Math.abs((opportunity.entryPrice - opportunity.currentPrice) / opportunity.currentPrice * 100);
    
    // Entry should be within 3% of current price
    if (entryDiff > 3) return false;
    
    // Risk/reward should be at least 2:1
    if (opportunity.riskRewardRatio < 2) return false;
    
    // Confidence should be at least 60%
    if (opportunity.confidence < 60) return false;
    
    // Stop loss should be reasonable (not more than 10%)
    if (opportunity.stopLossPercentage < -10) return false;
    
    return true;
  }

  // Default criteria if parsing fails
  protected getDefaultCriteria(): SearchCriteria {
    return {
      priceRange: { min: 10, max: 500 },
      riskTolerance: 'medium',
      holdingPeriod: 'medium'
    };
  }
}