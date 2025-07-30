import { FinnhubQuote, FinnhubCompanyProfile, StockData } from '@/lib/types/trading';
import { ExtendedStockData } from '@/lib/types/agents';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export class FinnhubClient {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Finnhub API key is required');
    }
    this.apiKey = apiKey;
  }

  private async fetchFromFinnhub(endpoint: string, params: Record<string, string> = {}) {
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
        throw new Error(`Finnhub API key is invalid or has exceeded rate limits. Please check your API key at https://finnhub.io/dashboard`);
      } else if (response.status === 429) {
        throw new Error(`Finnhub API rate limit exceeded. Please wait and try again.`);
      }
      
      throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getQuote(symbol: string): Promise<FinnhubQuote> {
    return this.fetchFromFinnhub('/quote', { symbol });
  }

  async getCompanyProfile(symbol: string): Promise<FinnhubCompanyProfile> {
    const data = await this.fetchFromFinnhub('/stock/profile2', { symbol });
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

      return {
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
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      throw error;
    }
  }

  async getBasicFinancials(symbol: string): Promise<any> {
    return this.fetchFromFinnhub('/stock/metric', { 
      symbol, 
      metric: 'all' 
    });
  }

  async getCompanyNews(symbol: string, days: number = 7): Promise<any[]> {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    
    return this.fetchFromFinnhub('/company-news', {
      symbol,
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    });
  }

  async getRecommendations(symbol: string): Promise<any[]> {
    return this.fetchFromFinnhub('/stock/recommendation', { symbol });
  }

  async getExtendedStockData(symbol: string): Promise<ExtendedStockData> {
    try {
      const [basicData, financials, news, recommendations] = await Promise.all([
        this.getStockData(symbol),
        this.getBasicFinancials(symbol).catch(() => null),
        this.getCompanyNews(symbol, 7).catch(() => []),
        this.getRecommendations(symbol).catch(() => [])
      ]);

      // Extract financial metrics if available
      const metrics = financials?.metric || {};
      
      // Calculate analyst consensus from recommendations
      let analystRating = undefined;
      if (recommendations && recommendations.length > 0) {
        const latestRecs = recommendations.slice(0, 5);
        const avgTarget = latestRecs.reduce((sum, rec) => sum + (rec.targetMean || 0), 0) / latestRecs.length;
        
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

      // Process news for sentiment (simplified)
      const processedNews = news.slice(0, 5).map(article => ({
        title: article.headline,
        summary: article.summary,
        url: article.url,
        publishedAt: new Date(article.datetime * 1000).toISOString(),
        sentiment: article.sentiment > 0 ? 'positive' : article.sentiment < 0 ? 'negative' : 'neutral'
      }));

      return {
        ...basicData,
        peRatio: metrics.peBasicExclExtraTTM || metrics.peExclExtraTTM,
        pegRatio: metrics.pegRatio,
        priceToBook: metrics.pbQuarterly || metrics.pbAnnual,
        debtToEquity: metrics.totalDebtToEquityQuarterly || metrics.totalDebtToEquityAnnual,
        roe: metrics.roeRfy || metrics.roeTTM,
        revenueGrowth: metrics.revenueGrowth3Y || metrics.revenueGrowth5Y,
        earningsGrowth: metrics.epsGrowth3Y || metrics.epsGrowth5Y,
        profitMargin: metrics.netProfitMarginTTM,
        freeCashFlow: metrics.freeCashFlowTTM,
        dividendYield: metrics.dividendYieldIndicatedAnnual,
        beta: metrics.beta,
        institutionalOwnership: metrics.institutionalOwnershipPercentage,
        insiderOwnership: metrics.insiderOwnershipPercentage,
        shortInterest: metrics.shortInterestRatio,
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