import { NextRequest, NextResponse } from 'next/server'
import { FinnhubClient } from '@/lib/finnhub'

interface StockData {
  symbol: string
  companyName: string
  currentPrice: number
  change: number
  changePercent: number
  volume?: number
  high?: number
  low?: number
  open?: number
  previousClose?: number
  marketCap?: number
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const symbol = searchParams.get('symbol')

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      )
    }

    if (!process.env.FINNHUB_API_KEY) {
      // Return mock data if no API key
      const currentPrice = 100 + Math.random() * 200
      const change = (Math.random() - 0.5) * 10
      const changePercent = (Math.random() - 0.5) * 5
      
      const mockResponse = {
        quote: {
          c: currentPrice,
          d: change,
          dp: changePercent,
          h: currentPrice + Math.random() * 5,
          l: currentPrice - Math.random() * 5,
          o: currentPrice + (Math.random() - 0.5) * 2,
          pc: currentPrice - change
        },
        profile: {
          name: getCompanyName(symbol),
          marketCapitalization: Math.floor(Math.random() * 1000000000)
        }
      }
      
      return NextResponse.json(mockResponse)
    }

    const finnhub = new FinnhubClient(process.env.FINNHUB_API_KEY!)

    // Fetch both quote and company profile in parallel
    const [quote, profile] = await Promise.all([
      finnhub.getQuote(symbol.toUpperCase()),
      finnhub.getCompanyProfile(symbol.toUpperCase()).catch(() => null)
    ])

    const stockData: StockData = {
      symbol: symbol.toUpperCase(),
      companyName: profile?.name || getCompanyName(symbol),
      currentPrice: quote.c || 0,
      change: quote.d || 0,
      changePercent: quote.dp || 0,
      high: quote.h || 0,
      low: quote.l || 0,
      open: quote.o || 0,
      previousClose: quote.pc || 0,
      marketCap: profile?.marketCapitalization ? profile.marketCapitalization * 1000000 : undefined
    }

    // Return in the format expected by the chart component
    const response = {
      quote: {
        c: stockData.currentPrice,
        d: stockData.change,
        dp: stockData.changePercent,
        h: stockData.high,
        l: stockData.low,
        o: stockData.open,
        pc: stockData.previousClose
      },
      profile: {
        name: stockData.companyName,
        marketCapitalization: stockData.marketCap
      }
    }

    // Cache for 1 minute
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })

  } catch (error) {
    console.error('Error fetching stock quote:', error)
    
    // Return graceful error with mock data in expected format
    const symbol = request.nextUrl.searchParams.get('symbol') || 'UNKNOWN'
    const fallbackResponse = {
      quote: {
        c: 100,
        d: 0,
        dp: 0,
        h: 100,
        l: 100,
        o: 100,
        pc: 100
      },
      profile: {
        name: getCompanyName(symbol),
        marketCapitalization: 0
      }
    }
    
    return NextResponse.json(fallbackResponse)
  }
}

function getCompanyName(symbol: string): string {
  const companies: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla, Inc.',
    'META': 'Meta Platforms Inc.',
    'NVDA': 'NVIDIA Corporation',
    'JPM': 'JPMorgan Chase & Co.',
    'V': 'Visa Inc.',
    'WMT': 'Walmart Inc.',
    'JNJ': 'Johnson & Johnson',
    'PG': 'Procter & Gamble Co.',
    'UNH': 'UnitedHealth Group Inc.',
    'HD': 'The Home Depot Inc.',
    'MA': 'Mastercard Inc.',
    'DIS': 'The Walt Disney Company',
    'PYPL': 'PayPal Holdings Inc.',
    'BAC': 'Bank of America Corp.',
    'NFLX': 'Netflix Inc.',
    'ADBE': 'Adobe Inc.',
    'CRM': 'Salesforce Inc.',
    'PFE': 'Pfizer Inc.',
    'ABT': 'Abbott Laboratories',
    'NKE': 'Nike Inc.',
    'INTC': 'Intel Corporation',
    'CSCO': 'Cisco Systems Inc.',
    'AMD': 'Advanced Micro Devices Inc.',
    'IBM': 'International Business Machines',
    'ORCL': 'Oracle Corporation',
    'QCOM': 'Qualcomm Inc.'
  }
  return companies[symbol.toUpperCase()] || symbol.toUpperCase()
}