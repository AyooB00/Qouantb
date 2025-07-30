import { NextRequest, NextResponse } from 'next/server';
import { AnalysisResult, StockData } from '@/lib/types/trading';
import { FinnhubClient } from '@/lib/finnhub';
import { AIProviderFactory } from '@/lib/ai-providers/provider-factory';

// Popular US stocks for demonstration - includes various price ranges
const DEMO_STOCK_SYMBOLS = [
  // Large tech companies
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA',
  // Mid-priced tech stocks
  'ORCL', 'CSCO', 'IBM', 'INTC', 'AMD', 'MU',
  // Lower-priced tech stocks  
  'SNAP', 'PLTR', 'ROKU', 'UBER', 'LYFT', 'SQ',
  // Additional tech stocks often under $100
  'PINS', 'TWTR', 'ZM', 'DOCU', 'OKTA', 'NET', 
  'DDOG', 'PATH', 'U', 'RBLX', 'HOOD', 'SOFI',
  // More tech stocks across price ranges
  'TWLO', 'SHOP', 'SPOT', 'DBX', 'BOX', 'WORK',
  'TEAM', 'CRWD', 'PANW', 'ZS', 'SNOW', 'AI',
  'FIVN', 'PSTG', 'ESTC', 'SUMO', 'S', 'SMAR',
  'VEEV', 'WDAY', 'CRM', 'NOW', 'ADBE', 'INTU',
  'DELL', 'HPQ', 'HPE', 'NTNX', 'VMWARE', 'GTLB',
  'SPLK', 'DOMO', 'MDB', 'FSLY', 'CFLT', 'AFRM',
  'UPST', 'COIN', 'RIVN', 'LCID', 'NIO', 'XPEV',
  // More affordable tech stocks
  'BBBY', 'WISH', 'CLOV', 'SPCE', 'OPEN', 'SKLZ',
  'FUBO', 'LAZR', 'QS', 'GOEV', 'RIDE', 'WKHS',
  'BLNK', 'CHPT', 'EVGO', 'VLDR', 'OUST', 'AEVA',
  'IONQ', 'ARQQ', 'BIGC', 'APPS', 'MGNI', 'PUBM',
  'TTD', 'BILI', 'IQ', 'HUYA', 'DOYU', 'YY',
  'VIPS', 'JD', 'BABA', 'BIDU', 'NTES', 'TME',
  // Finance
  'JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'V', 'MA',
  // Consumer
  'DIS', 'NKE', 'SBUX', 'MCD', 'KO', 'PEP',
  // Healthcare
  'JNJ', 'PFE', 'MRNA', 'CVS', 'UNH', 'ABBV'
];

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid search prompt' },
        { status: 400 }
      );
    }

    // Validate API keys
    if (!process.env.FINNHUB_API_KEY || !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'API keys not configured' },
        { status: 500 }
      );
    }

    // Get AI provider factory
    const aiFactory = AIProviderFactory.getInstance();

    // Get AI provider and parse the prompt first
    const provider = aiFactory.getProvider();
    const criteria = await provider.parsePrompt(prompt);
    console.log('Parsed criteria:', criteria);

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
    console.log('Starting to fetch stock data...');
    let fetchedCount = 0;
    let priceFilteredOut = 0;
    let sectorFilteredOut = 0;
    
    for (const symbol of DEMO_STOCK_SYMBOLS) {
      try {
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 250)); // Increased delay for API rate limits
        
        const stockData = await finnhub.getStockData(symbol);
        fetchedCount++;
        
        console.log(`Fetched ${symbol}: Price=$${stockData.currentPrice}, Sector="${stockData.sector || 'N/A'}"`);
        
        // Filter based on price range
        if (stockData.currentPrice < criteria.priceRange.min || 
            stockData.currentPrice > criteria.priceRange.max) {
          console.log(`  ❌ Price filtered out: $${stockData.currentPrice} not in range $${criteria.priceRange.min}-$${criteria.priceRange.max}`);
          priceFilteredOut++;
          continue;
        }
        
        // Filter by market cap if specified
        if (criteria.marketCapRange) {
          if (!stockData.marketCap || 
              stockData.marketCap < criteria.marketCapRange.min || 
              stockData.marketCap > criteria.marketCapRange.max) {
            console.log(`  ❌ Market cap filtered out`);
            continue;
          }
        }
        
        // Filter by sector if specified
        if (criteria.sectors && criteria.sectors.length > 0) {
          if (!stockData.sector) {
            console.log(`  ⚠️  No sector data for ${symbol} - including anyway for tech request`);
            // For tech stocks, include symbols that are known tech companies even without sector data
            const knownTechStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'ORCL', 'CSCO', 'IBM', 'INTC', 'AMD', 'MU', 'SNAP', 'PLTR', 'ROKU', 'UBER', 'LYFT', 'SQ'];
            if (criteria.sectors.includes('Technology') && !knownTechStocks.includes(symbol)) {
              console.log(`  ❌ Unknown stock without sector data, filtering out`);
              sectorFilteredOut++;
              continue;
            }
          } else {
            // Flexible sector matching
            const sectorMatch = criteria.sectors.some(requestedSector => {
              const normalizedRequested = requestedSector.toLowerCase();
              const normalizedActual = stockData.sector.toLowerCase();
              
              // Map technology-related sectors
              const techRelatedSectors = [
                'technology', 'semiconductors', 'software', 'electronics', 
                'communications', 'telecommunication', 'internet', 'computer',
                'hardware', 'information technology', 'it services', 'tech'
              ];
              
              // Check if requesting technology and actual sector is tech-related
              if (normalizedRequested === 'technology') {
                return techRelatedSectors.some(tech => normalizedActual.includes(tech));
              }
              
              // Check for partial matches for other sectors
              return normalizedActual.includes(normalizedRequested) || 
                     normalizedRequested.includes(normalizedActual);
            });
            
            if (!sectorMatch) {
              console.log(`  ❌ Sector filtered out: "${stockData.sector}" not matching [${criteria.sectors.join(', ')}]`);
              sectorFilteredOut++;
              continue;
            }
          }
        }
        
        console.log(`  ✅ Added ${symbol} to analysis`);
        stocksToAnalyze.push(stockData);
        
        // Limit to 30 stocks to control API usage and costs
        if (stocksToAnalyze.length >= 30) {
          console.log('Reached 30 stocks limit, stopping fetch');
          break;
        }
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        errors.push(`Failed to fetch ${symbol}`);
        continue;
      }
    }
    
    console.log(`\nSummary: Fetched ${fetchedCount} stocks, Price filtered: ${priceFilteredOut}, Sector filtered: ${sectorFilteredOut}, Selected: ${stocksToAnalyze.length}`);
    
    if (stocksToAnalyze.length === 0) {
      console.log('\n⚠️  No stocks found! Debugging info:');
      console.log('Criteria:', JSON.stringify(criteria, null, 2));
      console.log('Errors:', errors);
      
      // If sector filtering caused all rejections, suggest removing sector filter
      if (sectorFilteredOut > 0 && priceFilteredOut === 0) {
        return NextResponse.json(
          { error: 'No stocks found in the specified sector. The Finnhub API may use different sector names. Try a search without specifying sectors.' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'No stocks found matching your criteria. Try adjusting your search prompt.' },
        { status: 404 }
      );
    }
    
    console.log(`Analyzing ${stocksToAnalyze.length} stocks...`);
    
    // Analyze stocks with AI provider
    const opportunities = await provider.analyzeStocks(stocksToAnalyze, criteria);
    
    console.log(`Found ${opportunities.length} opportunities`);
    
    const result: AnalysisResult = {
      opportunities,
      timestamp: new Date().toISOString(),
      criteria,
      totalAnalyzed: stocksToAnalyze.length
    };
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in analyze-stocks-prompt API:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request' },
      { status: 500 }
    );
  }
}