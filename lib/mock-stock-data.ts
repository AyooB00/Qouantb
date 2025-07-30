import { StockData } from '@/lib/types/trading';

// Mock data for development/testing when Finnhub API is unavailable
export const MOCK_STOCK_DATA: StockData[] = [
  {
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    currentPrice: 95.50,
    previousClose: 93.25,
    change: 2.25,
    changePercent: 2.41,
    volume: 52000000,
    marketCap: 3000000000000,
    sector: 'Technology',
    technicalIndicators: {
      rsi: 55,
      macd: {
        macd: 2.5,
        signal: 2.3,
        histogram: 0.2
      },
      sma20: 92.50,
      sma50: 88.75,
      sma200: 80.25
    }
  },
  {
    symbol: 'MSFT',
    companyName: 'Microsoft Corporation',
    currentPrice: 85.30,
    previousClose: 84.10,
    change: 1.20,
    changePercent: 1.43,
    volume: 28000000,
    marketCap: 3150000000000,
    sector: 'Technology',
    technicalIndicators: {
      rsi: 62,
      macd: {
        macd: 5.2,
        signal: 4.8,
        histogram: 0.4
      }
    }
  },
  {
    symbol: 'GOOGL',
    companyName: 'Alphabet Inc.',
    currentPrice: 72.75,
    previousClose: 71.00,
    change: 1.75,
    changePercent: 2.46,
    volume: 25000000,
    marketCap: 1800000000000,
    sector: 'Technology',
    technicalIndicators: {
      rsi: 48,
      macd: {
        macd: -0.5,
        signal: -0.3,
        histogram: -0.2
      }
    }
  },
  {
    symbol: 'AMD',
    companyName: 'Advanced Micro Devices',
    currentPrice: 45.50,
    previousClose: 44.25,
    change: 1.25,
    changePercent: 2.82,
    volume: 45000000,
    marketCap: 220000000000,
    sector: 'Technology',
    technicalIndicators: {
      rsi: 52,
      macd: {
        macd: 1.5,
        signal: 1.2,
        histogram: 0.3
      }
    }
  },
  {
    symbol: 'INTC',
    companyName: 'Intel Corporation',
    currentPrice: 35.25,
    previousClose: 34.50,
    change: 0.75,
    changePercent: 2.17,
    volume: 18000000,
    marketCap: 150000000000,
    sector: 'Technology',
    technicalIndicators: {
      rsi: 45,
      macd: {
        macd: 0.8,
        signal: 0.6,
        histogram: 0.2
      }
    }
  },
  {
    symbol: 'AMZN',
    companyName: 'Amazon.com Inc.',
    currentPrice: 178.90,
    previousClose: 176.50,
    change: 2.40,
    changePercent: 1.36,
    volume: 35000000,
    marketCap: 1850000000000,
    sector: 'Consumer Discretionary',
    technicalIndicators: {
      rsi: 51,
      macd: {
        macd: 1.2,
        signal: 1.0,
        histogram: 0.2
      }
    }
  },
  {
    symbol: 'PLTR',
    companyName: 'Palantir Technologies',
    currentPrice: 18.75,
    previousClose: 18.20,
    change: 0.55,
    changePercent: 3.02,
    volume: 65000000,
    marketCap: 40000000000,
    sector: 'Technology',
    technicalIndicators: {
      rsi: 58,
      macd: {
        macd: 0.3,
        signal: 0.2,
        histogram: 0.1
      }
    }
  },
  {
    symbol: 'JPM',
    companyName: 'JPMorgan Chase & Co.',
    currentPrice: 195.80,
    previousClose: 194.25,
    change: 1.55,
    changePercent: 0.80,
    volume: 12000000,
    marketCap: 570000000000,
    sector: 'Finance',
    technicalIndicators: {
      rsi: 53,
      macd: {
        macd: 1.8,
        signal: 1.6,
        histogram: 0.2
      }
    }
  },
  {
    symbol: 'NFLX',
    companyName: 'Netflix Inc.',
    currentPrice: 485.50,
    previousClose: 480.00,
    change: 5.50,
    changePercent: 1.15,
    volume: 8000000,
    marketCap: 215000000000,
    sector: 'Communication Services',
    technicalIndicators: {
      rsi: 60,
      macd: {
        macd: 4.5,
        signal: 4.0,
        histogram: 0.5
      }
    }
  },
  {
    symbol: 'ORCL',
    companyName: 'Oracle Corporation',
    currentPrice: 65.30,
    previousClose: 64.00,
    change: 1.30,
    changePercent: 2.03,
    volume: 15000000,
    marketCap: 180000000000,
    sector: 'Technology',
    technicalIndicators: {
      rsi: 49,
      macd: {
        macd: 0.8,
        signal: 0.6,
        histogram: 0.2
      }
    }
  },
  {
    symbol: 'CSCO',
    companyName: 'Cisco Systems Inc.',
    currentPrice: 28.50,
    previousClose: 27.80,
    change: 0.70,
    changePercent: 2.52,
    volume: 22000000,
    marketCap: 120000000000,
    sector: 'Technology',
    technicalIndicators: {
      rsi: 46,
      macd: {
        macd: 0.4,
        signal: 0.3,
        histogram: 0.1
      }
    }
  },
  {
    symbol: 'DELL',
    companyName: 'Dell Technologies Inc.',
    currentPrice: 55.75,
    previousClose: 54.50,
    change: 1.25,
    changePercent: 2.29,
    volume: 8000000,
    marketCap: 40000000000,
    sector: 'Technology',
    technicalIndicators: {
      rsi: 51,
      macd: {
        macd: 0.9,
        signal: 0.7,
        histogram: 0.2
      }
    }
  }
];

export function getMockStockData(criteria: {
  priceRange: { min: number; max: number };
  sectors?: string[];
}): StockData[] {
  return MOCK_STOCK_DATA.filter(stock => {
    // Filter by price range
    if (stock.currentPrice < criteria.priceRange.min || stock.currentPrice > criteria.priceRange.max) {
      return false;
    }
    
    // Filter by sectors if specified
    if (criteria.sectors && criteria.sectors.length > 0) {
      if (!stock.sector || !criteria.sectors.includes(stock.sector)) {
        return false;
      }
    }
    
    return true;
  });
}