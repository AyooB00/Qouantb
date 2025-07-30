import { BaseAIProvider } from './types';
import { SearchCriteria, StockData, TradingOpportunity } from '@/lib/types/trading';

// Placeholder for future Gemini implementation
export class GeminiProvider extends BaseAIProvider {
  name = 'Gemini';

  constructor(apiKey: string, model?: string) {
    super(apiKey, model || 'gemini-1.5-pro');
    // TODO: Initialize Gemini client when SDK is available
  }

  async parsePrompt(_prompt: string): Promise<SearchCriteria> {
    // TODO: Implement Gemini-specific prompt parsing
    console.warn('Gemini provider not yet implemented, using defaults');
    return this.getDefaultCriteria();
  }

  async analyzeStocks(_stocks: StockData[], _criteria: SearchCriteria): Promise<TradingOpportunity[]> {
    // TODO: Implement Gemini-specific stock analysis
    console.warn('Gemini provider not yet implemented');
    return [];
  }
}