import { NextRequest, NextResponse } from 'next/server';
import { FinnhubClient } from '@/lib/finnhub';
import { handleAPIError, validateAPIKeys } from '@/lib/api/error-handler';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const nasdaqOnly = searchParams.get('nasdaqOnly') === 'true';

    if (!query || query.length < 1) {
      return NextResponse.json({ results: [] });
    }

    // Validate API keys
    validateAPIKeys(['FINNHUB_API_KEY']);

    const finnhub = new FinnhubClient(process.env.FINNHUB_API_KEY);
    const results = await finnhub.searchStocks(query);

    // Filter to only show common stocks and ETFs, limit results
    let filteredResults = results
      .filter(stock => 
        stock.type === 'Common Stock' || 
        stock.type === 'ETF' ||
        stock.type === 'ADR'
      );

    // If nasdaqOnly is true, filter for NASDAQ stocks
    // Note: Finnhub doesn't provide exchange info in search results,
    // so we'll check for common NASDAQ patterns and tech stocks
    if (nasdaqOnly) {
      filteredResults = filteredResults.filter(stock => {
        // Check if it's a known NASDAQ stock based on common patterns
        // In production, you'd want to maintain a list of NASDAQ symbols
        const symbol = stock.symbol.toUpperCase();
        
        // Common NASDAQ characteristics:
        // - Tech companies (AAPL, MSFT, GOOGL, META, NVDA, etc.)
        // - 4-letter symbols are often NASDAQ
        // - Biotech companies
        // - Many growth stocks
        
        const knownNasdaqSymbols = [
          'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'META', 'NVDA', 'TSLA', 'AMZN',
          'NFLX', 'ADBE', 'INTC', 'CSCO', 'CMCSA', 'COST', 'PYPL', 'AMD',
          'QCOM', 'SBUX', 'INTU', 'BKNG', 'ISRG', 'VRTX', 'REGN', 'ATVI',
          'BIIB', 'ILMN', 'LRCX', 'MNST', 'SNPS', 'CDNS', 'ASML', 'MRVL',
          'ORLY', 'NXPI', 'KLAC', 'MELI', 'CTAS', 'LULU', 'MCHP', 'PANW',
          'ABNB', 'DXCM', 'WDAY', 'ROST', 'ODFL', 'PCAR', 'CPRT', 'IDXX',
          'VRSK', 'ANSS', 'FAST', 'PAYX', 'DLTR', 'CSGP', 'ALGN', 'SWKS'
        ];
        
        // Check if it's a known NASDAQ symbol or follows NASDAQ patterns
        return knownNasdaqSymbols.includes(symbol) || 
               symbol.length === 4 || // Many NASDAQ stocks have 4-letter symbols
               stock.description.toLowerCase().includes('nasdaq') ||
               stock.description.toLowerCase().includes('technology') ||
               stock.description.toLowerCase().includes('biotech');
      });
    }

    const finalResults = filteredResults
      .slice(0, 20)
      .map(stock => ({
        symbol: stock.symbol,
        description: stock.description,
        type: stock.type,
        exchange: nasdaqOnly ? 'NASDAQ' : 'US' // Add exchange info
      }));

    return NextResponse.json({ results: finalResults });

  } catch (error) {
    return handleAPIError(error);
  }
}