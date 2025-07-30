import { NextRequest, NextResponse } from 'next/server';
import { FinnhubClient } from '@/lib/finnhub';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 1) {
      return NextResponse.json({ results: [] });
    }

    if (!process.env.FINNHUB_API_KEY) {
      return NextResponse.json(
        { error: 'Finnhub API key not configured' },
        { status: 500 }
      );
    }

    const finnhub = new FinnhubClient(process.env.FINNHUB_API_KEY);
    const results = await finnhub.searchStocks(query);

    // Filter to only show common stocks and ETFs, limit results
    const filteredResults = results
      .filter(stock => 
        stock.type === 'Common Stock' || 
        stock.type === 'ETF' ||
        stock.type === 'ADR'
      )
      .slice(0, 20)
      .map(stock => ({
        symbol: stock.symbol,
        description: stock.description,
        type: stock.type
      }));

    return NextResponse.json({ results: filteredResults });

  } catch (error) {
    console.error('Error searching stocks:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to search stocks' },
      { status: 500 }
    );
  }
}