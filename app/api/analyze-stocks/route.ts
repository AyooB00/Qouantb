import { NextRequest } from 'next/server';
import { AnalysisResult, StockData } from '@/lib/types/trading';
import { FinnhubClient } from '@/lib/finnhub';
import { analyzeStocksWithAI, validateTradingOpportunity } from '@/lib/openai';
import { withRateLimit } from '@/lib/middleware/rateLimiter';
import { successResponse, errorResponse, ApiError, ErrorCodes, validateEnvVars } from '@/lib/api/response';
import { searchCriteriaSchema } from '@/lib/validation/schemas';

// Popular US stocks for demonstration - in production, you'd use a stock screener
const DEMO_STOCK_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'JNJ',
  'WMT', 'PG', 'MA', 'UNH', 'HD', 'DIS', 'BAC', 'ADBE', 'CRM', 'NFLX',
  'PFE', 'KO', 'PEP', 'ABBV', 'TMO', 'CSCO', 'VZ', 'CMCSA', 'INTC', 'ORCL'
];

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await withRateLimit(request, {
    windowMs: 60 * 1000, // 1 minute
    max: 10 // 10 requests per minute for this expensive operation
  });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // Validate request body
    const body = await request.json();
    const criteria = searchCriteriaSchema.parse(body);
    
    // Validate API keys
    try {
      validateEnvVars(['FINNHUB_API_KEY', 'OPENAI_API_KEY']);
    } catch (error) {
      return errorResponse(error as ApiError);
    }

    const finnhub = new FinnhubClient(process.env.FINNHUB_API_KEY!);
    
    // Filter stocks based on criteria
    const stocksToAnalyze: StockData[] = [];
    const errors: string[] = [];
    
    // Get market status first
    try {
      const marketStatus = await finnhub.getMarketStatus();
      console.log('Market status:', marketStatus);
    } catch (error) {
      console.warn('Could not fetch market status:', error);
    }
    
    // Fetch data for demo stocks (in production, use a proper stock screener)
    for (const symbol of DEMO_STOCK_SYMBOLS) {
      try {
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const stockData = await finnhub.getStockData(symbol);
        
        // Filter based on price range
        if (stockData.currentPrice >= criteria.priceRange.min && 
            stockData.currentPrice <= criteria.priceRange.max) {
          
          // Filter by market cap if specified
          if (criteria.marketCapRange) {
            if (!stockData.marketCap || 
                stockData.marketCap < criteria.marketCapRange.min || 
                stockData.marketCap > criteria.marketCapRange.max) {
              continue;
            }
          }
          
          // Filter by sector if specified
          if (criteria.sectors && criteria.sectors.length > 0) {
            if (!stockData.sector || !criteria.sectors.includes(stockData.sector)) {
              continue;
            }
          }
          
          stocksToAnalyze.push(stockData);
        }
        
        // Limit to 20 stocks to control costs
        if (stocksToAnalyze.length >= 20) {
          break;
        }
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        errors.push(`Failed to fetch ${symbol}`);
        continue;
      }
    }
    
    if (stocksToAnalyze.length === 0) {
      throw new ApiError(
        ErrorCodes.NOT_FOUND,
        'No stocks found matching your criteria. Try adjusting your filters.',
        404
      );
    }
    
    console.log(`Analyzing ${stocksToAnalyze.length} stocks...`);
    
    // Analyze stocks with OpenAI
    const opportunities = await analyzeStocksWithAI(stocksToAnalyze, criteria);
    
    // Validate opportunities
    const validOpportunities = [];
    for (const opportunity of opportunities) {
      if (await validateTradingOpportunity(opportunity)) {
        validOpportunities.push(opportunity);
      }
    }
    
    const result: AnalysisResult = {
      opportunities: validOpportunities,
      timestamp: new Date().toISOString(),
      criteria,
      totalAnalyzed: stocksToAnalyze.length
    };
    
    return successResponse(result, {
      totalAnalyzed: stocksToAnalyze.length,
      opportunitiesFound: validOpportunities.length
    });
    
  } catch (error) {
    console.error('Error in analyze-stocks API:', error);
    
    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse(
        new ApiError(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid request data',
          400,
          error
        )
      );
    }
    
    // Handle API errors
    if (error instanceof ApiError) {
      return errorResponse(error);
    }
    
    // Generic error
    return errorResponse(
      new ApiError(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'An unexpected error occurred',
        500
      )
    );
  }
}

