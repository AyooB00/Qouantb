'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Stock {
  symbol: string;
  description: string;
  type?: string;
  change?: number;
}

interface StockSelectorCardsProps {
  onSelect: (symbol: string) => void;
  selectedSymbol?: string;
  disabled?: boolean;
}

export default function StockSelectorCards({ onSelect, selectedSymbol, disabled }: StockSelectorCardsProps) {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Popular stocks with mock price changes for visual appeal
  const popularStocks: Stock[] = [
    { symbol: 'AAPL', description: 'Apple Inc', change: 2.5 },
    { symbol: 'MSFT', description: 'Microsoft Corp', change: -0.8 },
    { symbol: 'GOOGL', description: 'Alphabet Inc', change: 1.2 },
    { symbol: 'AMZN', description: 'Amazon.com', change: -1.5 },
    { symbol: 'TSLA', description: 'Tesla Inc', change: 3.8 },
    { symbol: 'META', description: 'Meta Platforms', change: 0.5 },
    { symbol: 'NVDA', description: 'NVIDIA Corp', change: 4.2 },
    { symbol: 'BRK.B', description: 'Berkshire Hathaway', change: -0.3 },
    { symbol: 'JPM', description: 'JPMorgan Chase', change: 1.1 },
    { symbol: 'V', description: 'Visa Inc', change: 0.7 },
    { symbol: 'JNJ', description: 'Johnson & Johnson', change: -0.2 },
    { symbol: 'WMT', description: 'Walmart Inc', change: 0.9 },
  ];

  const searchStocks = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setLoading(true);
    setShowSearchResults(true);
    
    try {
      const response = await fetch(`/api/search-stocks?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchStocks(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, searchStocks]);

  const handleSelect = (symbol: string) => {
    onSelect(symbol);
    setShowSearchResults(false);
    setSearch('');
  };

  const displayStocks = showSearchResults ? searchResults : popularStocks;

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search stocks by symbol or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          disabled={disabled}
        />
        {search && (
          <button
            onClick={() => {
              setSearch('');
              setShowSearchResults(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {showSearchResults ? 'Search Results' : 'Popular Stocks'}
        </h3>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Searching...
          </div>
        )}
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {displayStocks.length > 0 ? (
          displayStocks.slice(0, 12).map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => handleSelect(stock.symbol)}
              disabled={disabled}
              className={cn(
                "relative p-3 rounded-lg border-2 transition-all text-left",
                "hover:shadow-md hover:border-primary/50",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                selectedSymbol === stock.symbol 
                  ? "border-primary bg-primary/5" 
                  : "border-border",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="space-y-1">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-base">{stock.symbol}</h4>
                  {stock.change !== undefined && (
                    <div className={cn(
                      "flex items-center gap-0.5 text-xs font-medium",
                      stock.change > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {stock.change > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(stock.change)}%
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {stock.description}
                </p>
              </div>
              
              {selectedSymbol === stock.symbol && (
                <div className="absolute top-1 right-1">
                  <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                    <svg
                      className="h-2.5 w-2.5 text-primary-foreground"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            {loading ? 'Searching...' : 'No stocks found'}
          </div>
        )}
      </div>

      {/* Selected Stock Display */}
      {selectedSymbol && !showSearchResults && (
        <div className="mt-2 p-2 bg-muted/50 rounded-md">
          <p className="text-xs text-muted-foreground">
            Selected: <span className="font-medium text-foreground">{selectedSymbol}</span>
          </p>
        </div>
      )}
    </div>
  );
}