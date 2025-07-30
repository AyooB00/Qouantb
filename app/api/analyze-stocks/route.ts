import { NextRequest, NextResponse } from 'next/server';
import { SearchCriteria, AnalysisResult, StockData } from '@/lib/types/trading';
import { FinnhubClient } from '@/lib/finnhub';
import { analyzeStocksWithAI, validateTradingOpportunity } from '@/lib/openai';

// Popular US stocks for demonstration - in production, you'd use a stock screener
const DEMO_STOCK_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'JNJ',
  'WMT', 'PG', 'MA', 'UNH', 'HD', 'DIS', 'BAC', 'ADBE', 'CRM', 'NFLX',
  'PFE', 'KO', 'PEP', 'ABBV', 'TMO', 'CSCO', 'VZ', 'CMCSA', 'INTC', 'ORCL'
];

export async function POST(request: NextRequest) {
  try {
    const criteria: SearchCriteria = await request.json();
    
    // Validate API keys
    if (!process.env.FINNHUB_API_KEY || !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'API keys not configured' },
        { status: 500 }
      );
    }

    const finnhub = new FinnhubClient(process.env.FINNHUB_API_KEY);
    
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
      return NextResponse.json(
        { error: 'No stocks found matching your criteria. Try adjusting your filters.' },
        { status: 404 }
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
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in analyze-stocks API:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

