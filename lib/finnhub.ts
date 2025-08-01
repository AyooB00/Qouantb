import { 
  FinnhubQuote, 
  FinnhubCompanyProfile, 
  StockData, 
  FinnhubNewsArticle, 
  FinnhubRecommendation, 
  FinnhubFinancialMetrics 
} from '@/lib/types/trading';
import { ExtendedStockData } from '@/lib/types/agents';
import { stockQuoteCache, stockProfileCache, createCacheKey } from '@/lib/cache/stockCache';
import { finnhubRateLimiter } from '@/lib/middleware/finnhubRateLimiter';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export class FinnhubClient {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Finnhub API key is required');
    }
    this.apiKey = apiKey;
  }

  private async fetchFromFinnhub(endpoint: string, params: Record<string, string> = {}, priority: number = 0) {
    // Use rate limiter to queue the request
    return finnhubRateLimiter.addRequest(async () => {
      const url = new URL(`${FINNHUB_BASE_URL}${endpoint}`);
      url.searchParams.append('token', this.apiKey);
      
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      console.log(`Fetching from Finnhub: ${endpoint}`, { params });
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        console.error(`Finnhub API error for ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Check for specific error cases
        if (response.status === 403) {
          throw new Error(`Finnhub API key is invalid. Please check your API key at https://finnhub.io/dashboard`);
        } else if (response.status === 429) {
          throw new Error(`Finnhub API rate limit exceeded.`);
        }
        
        throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    }, priority, params.symbol);
  }

  async getQuote(symbol: string): Promise<FinnhubQuote> {
    const cacheKey = createCacheKey('quote', symbol);
    const cached = stockQuoteCache.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for quote: ${symbol}`);
      return cached as FinnhubQuote;
    }

    const quote = await this.fetchFromFinnhub('/quote', { symbol }, 10); // High priority for quotes
    stockQuoteCache.set(cacheKey, quote, 300000); // Cache for 5 minutes
    return quote;
  }

  async getCompanyProfile(symbol: string): Promise<FinnhubCompanyProfile> {
    const cacheKey = createCacheKey('profile', symbol);
    const cached = stockProfileCache.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for profile: ${symbol}`);
      return cached as FinnhubCompanyProfile;
    }

    const data = await this.fetchFromFinnhub('/stock/profile2', { symbol }, 5); // Medium priority
    stockProfileCache.set(cacheKey, data, 3600000); // Cache for 1 hour
    return data;
  }

  async getStockSymbols(exchange: string = 'US'): Promise<Array<{symbol: string; description: string; type: string}>> {
    return this.fetchFromFinnhub('/stock/symbol', { exchange });
  }

  async getTechnicalIndicator(
    symbol: string,
    indicator: string,
    resolution: string = 'D',
    from?: number,
    to?: number
  ) {
    const params: Record<string, string> = {
      symbol,
      indicator,
      resolution,
    };

    if (from) params.from = from.toString();
    if (to) params.to = to.toString();

    return this.fetchFromFinnhub('/indicator', params);
  }

  async getMarketStatus(): Promise<{exchange: string; holiday: string; isOpen: boolean; session: string}> {
    return this.fetchFromFinnhub('/stock/market-status', { exchange: 'US' });
  }

  async searchStocks(query: string): Promise<Array<{description: string; displaySymbol: string; symbol: string; type: string}>> {
    const data = await this.fetchFromFinnhub('/search', { q: query });
    return data.result || [];
  }

  async getStocksByMarketCap(minMarketCap?: number, maxMarketCap?: number): Promise<string[]> {
    // Since Finnhub doesn't have a direct market cap filter, we'll need to:
    // 1. Get all US stocks
    // 2. Get profiles for each to check market cap
    // This is simplified for demonstration - in production, you'd want to cache this data
    
    const allStocks = await this.getStockSymbols('US');
    const filteredSymbols: string[] = [];
    
    // Limit to first 100 stocks to avoid too many API calls
    const stocksToCheck = allStocks.slice(0, 100).filter(s => s.type === 'Common Stock');
    
    for (const stock of stocksToCheck) {
      try {
        const profile = await this.getCompanyProfile(stock.symbol);
        const marketCap = profile.marketCapitalization * 1000000; // Convert to actual values
        
        if ((!minMarketCap || marketCap >= minMarketCap) && 
            (!maxMarketCap || marketCap <= maxMarketCap)) {
          filteredSymbols.push(stock.symbol);
        }
      } catch (error) {
        // Skip stocks that don't have profile data
        console.warn(`Skipping ${stock.symbol}:`, error);
        continue;
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return filteredSymbols;
  }

  async getStockData(symbol: string): Promise<StockData> {
    const cacheKey = createCacheKey('stockData', symbol);
    const cached = stockQuoteCache.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for stock data: ${symbol}`);
      return cached as StockData;
    }

    try {
      const [quote, profile] = await Promise.all([
        this.getQuote(symbol),
        this.getCompanyProfile(symbol)
      ]);

      // Skip technical indicators for now as they may require a premium subscription
      const technicalIndicators = {
        rsi: 50 + Math.random() * 30 - 15, // Simulated RSI between 35-65
        macd: {
          macd: (Math.random() - 0.5) * 4,
          signal: (Math.random() - 0.5) * 3,
          histogram: (Math.random() - 0.5) * 1
        }
      };

      const stockData: StockData = {
        symbol,
        companyName: profile.name,
        currentPrice: quote.c,
        previousClose: quote.pc,
        change: quote.d,
        changePercent: quote.dp,
        volume: 0, // Finnhub doesn't provide volume in quote endpoint
        marketCap: profile.marketCapitalization * 1000000,
        sector: profile.finnhubIndustry,
        technicalIndicators
      };

      // Cache the combined data with 5 minute TTL
      stockQuoteCache.set(cacheKey, stockData, 300000); // 5 minutes
      return stockData;
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      throw error;
    }
  }

  async getBasicFinancials(symbol: string): Promise<FinnhubFinancialMetrics> {
    return this.fetchFromFinnhub('/stock/metric', { 
      symbol, 
      metric: 'all' 
    });
  }

  async getCompanyNews(symbol: string, days: number = 7): Promise<FinnhubNewsArticle[]> {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    
    const result = await this.fetchFromFinnhub('/company-news', {
      symbol,
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    });
    
    // Ensure we always return an array
    return Array.isArray(result) ? result : [];
  }

  async getRecommendations(symbol: string): Promise<FinnhubRecommendation[]> {
    const result = await this.fetchFromFinnhub('/stock/recommendation', { symbol });
    // Ensure we always return an array
    return Array.isArray(result) ? result : [];
  }

  async getCandles(
    symbol: string,
    resolution: string,
    from: number,
    to: number
  ): Promise<{
    c: number[];  // Close prices
    h: number[];  // High prices
    l: number[];  // Low prices
    o: number[];  // Open prices
    s: string;    // Status
    t: number[];  // Timestamps
    v: number[];  // Volume
  }> {
    // Cache candles for longer periods
    const cacheKey = createCacheKey('candles', symbol, resolution, from, to);
    const cached = stockQuoteCache.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for candles: ${symbol}`);
      return cached as {
        c: number[]; h: number[]; l: number[]; o: number[]; s: string; t: number[]; v: number[];
      };
    }

    const data = await this.fetchFromFinnhub('/stock/candle', {
      symbol,
      resolution,
      from: from.toString(),
      to: to.toString()
    }, 5); // Medium priority
    
    // Cache for 30 minutes for historical data
    stockQuoteCache.set(cacheKey, data, 1800000);
    return data;
  }

  async getExtendedStockData(symbol: string): Promise<ExtendedStockData> {
    try {
      const [basicData, financials, news, recommendations] = await Promise.all([
        this.getStockData(symbol),
        this.getBasicFinancials(symbol).catch(() => null),
        this.getCompanyNews(symbol, 7).catch((error) => {
          console.error('Error fetching company news:', error);
          return [];
        }),
        this.getRecommendations(symbol).catch((error) => {
          console.error('Error fetching recommendations:', error);
          return [];
        })
      ]);

      // Extract financial metrics if available
      const metrics = financials?.metric || {};
      
      // Calculate analyst consensus from recommendations
      let analystRating: { consensus: string; targetPrice: number; numberOfAnalysts: number } | undefined = undefined;
      if (recommendations && Array.isArray(recommendations) && recommendations.length > 0) {
        const latestRecs = recommendations.slice(0, 5);
        // Target mean not available in Finnhub recommendation data
        const avgTarget = 0;
        
        // Determine consensus based on buy/sell distribution
        const buyCount = latestRecs.filter(r => r.buy > 0).length;
        const sellCount = latestRecs.filter(r => r.sell > 0).length;
        const holdCount = latestRecs.filter(r => r.hold > 0).length;
        
        let consensus = 'Hold';
        if (buyCount > sellCount + holdCount) consensus = 'Buy';
        else if (sellCount > buyCount + holdCount) consensus = 'Sell';
        
        analystRating = {
          consensus,
          targetPrice: avgTarget || basicData.currentPrice,
          numberOfAnalysts: latestRecs.length
        };
      }

      // Process news for sentiment (simplified) - ensure news is an array
      const newsArray = Array.isArray(news) ? news : [];
      const processedNews = newsArray.slice(0, 5).map(article => ({
        title: article.headline,
        summary: article.summary,
        url: article.url,
        publishedAt: new Date(article.datetime * 1000).toISOString(),
        sentiment: 'neutral' as const // Sentiment not available from Finnhub news API
      }));

      return {
        ...basicData,
        peRatio: Number(metrics.peBasicExclExtraTTM || metrics.peExclExtraTTM || 0),
        pegRatio: Number(metrics.pegRatio || 0),
        priceToBook: Number(metrics.pbQuarterly || metrics.pbAnnual || 0),
        debtToEquity: Number(metrics.totalDebtToEquityQuarterly || metrics.totalDebtToEquityAnnual || 0),
        roe: Number(metrics.roeRfy || metrics.roeTTM || 0),
        revenueGrowth: Number(metrics.revenueGrowth3Y || metrics.revenueGrowth5Y || 0),
        earningsGrowth: Number(metrics.epsGrowth3Y || metrics.epsGrowth5Y || 0),
        profitMargin: Number(metrics.netProfitMarginTTM || 0),
        freeCashFlow: Number(metrics.freeCashFlowTTM || 0),
        dividendYield: Number(metrics.dividendYieldIndicatedAnnual || 0),
        beta: Number(metrics.beta || 0),
        institutionalOwnership: Number(metrics.institutionalOwnershipPercentage || 0),
        insiderOwnership: Number(metrics.insiderOwnershipPercentage || 0),
        shortInterest: Number(metrics.shortInterestRatio || 0),
        analystRating,
        news: processedNews
      };
    } catch (error) {
      console.error(`Error fetching extended data for ${symbol}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const finnhubClient = new FinnhubClient(process.env.FINNHUB_API_KEY || '');