import { AIProvider } from './types';
import { OpenAIProvider } from './openai-provider';
import { GeminiProvider } from './gemini-provider';
import { SearchCriteria, StockData, TradingOpportunity } from '@/lib/types/trading';

export class AIProviderFactory {
  private static instance: AIProviderFactory;
  private providers: Map<string, AIProvider> = new Map();
  private currentProvider: string;
  private fallbackProvider?: string;

  private constructor() {
    // Initialize based on environment variables
    this.currentProvider = process.env.AI_PROVIDER || 'openai';
    this.fallbackProvider = process.env.AI_FALLBACK_PROVIDER;
    
    // Initialize available providers
    this.initializeProviders();
  }

  static getInstance(): AIProviderFactory {
    if (!AIProviderFactory.instance) {
      AIProviderFactory.instance = new AIProviderFactory();
    }
    return AIProviderFactory.instance;
  }

  private initializeProviders() {
    // Initialize OpenAI provider if configured
    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', new OpenAIProvider(
        process.env.OPENAI_API_KEY,
        process.env.OPENAI_MODEL
      ));
    }

    // Initialize Gemini provider if configured
    if (process.env.GOOGLE_API_KEY) {
      this.providers.set('gemini', new GeminiProvider(
        process.env.GOOGLE_API_KEY,
        process.env.GEMINI_MODEL
      ));
    }

    // Future: Add Grok provider
    // if (process.env.GROK_API_KEY) {
    //   this.providers.set('grok', new GrokProvider(
    //     process.env.GROK_API_KEY,
    //     process.env.GROK_MODEL
    //   ));
    // }
  }

  getProvider(providerName?: string): AIProvider {
    const name = providerName || this.currentProvider;
    const provider = this.providers.get(name);
    
    if (!provider) {
      // Try fallback provider
      if (this.fallbackProvider) {
        const fallback = this.providers.get(this.fallbackProvider);
        if (fallback) {
          console.warn(`Primary provider ${name} not available, using fallback ${this.fallbackProvider}`);
          return fallback;
        }
      }
      
      throw new Error(`AI provider ${name} not configured. Please check your environment variables.`);
    }
    
    return provider;
  }

  async analyzeWithFallback(
    prompt: string,
    stocks: StockData[],
    providerName?: string
  ): Promise<{ criteria: SearchCriteria; opportunities: TradingOpportunity[] }> {
    let lastError: Error | null = null;
    
    // Try primary provider
    try {
      const provider = this.getProvider(providerName);
      const criteria = await provider.parsePrompt(prompt);
      const opportunities = await provider.analyzeStocks(stocks, criteria);
      return { criteria, opportunities };
    } catch (error) {
      console.error(`Error with primary provider:`, error);
      lastError = error as Error;
    }
    
    // Try fallback if available
    if (this.fallbackProvider) {
      try {
        const provider = this.getProvider(this.fallbackProvider);
        const criteria = await provider.parsePrompt(prompt);
        const opportunities = await provider.analyzeStocks(stocks, criteria);
        return { criteria, opportunities };
      } catch (error) {
        console.error(`Error with fallback provider:`, error);
        lastError = error as Error;
      }
    }
    
    throw lastError || new Error('All AI providers failed');
  }

  listAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}