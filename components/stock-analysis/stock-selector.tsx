'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Stock {
  symbol: string;
  description: string;
  type: string;
}

interface StockSelectorProps {
  onSelect: (symbol: string) => void;
  selectedSymbol?: string;
  disabled?: boolean;
}

export default function StockSelector({ onSelect, selectedSymbol, disabled }: StockSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  // Popular stocks for quick selection
  const popularStocks = [
    { symbol: 'AAPL', description: 'Apple Inc' },
    { symbol: 'MSFT', description: 'Microsoft Corporation' },
    { symbol: 'GOOGL', description: 'Alphabet Inc' },
    { symbol: 'AMZN', description: 'Amazon.com Inc' },
    { symbol: 'TSLA', description: 'Tesla Inc' },
    { symbol: 'META', description: 'Meta Platforms Inc' },
    { symbol: 'NVDA', description: 'NVIDIA Corporation' },
    { symbol: 'BRK.B', description: 'Berkshire Hathaway Inc' },
  ];

  const searchStocks = useCallback(async (query: string) => {
    if (query.length < 2) {
      setStocks([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search-stocks?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setStocks(data.results || []);
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
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

  const handleSelect = (stock: Stock) => {
    setSelectedStock(stock);
    onSelect(stock.symbol);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Stock</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between",
                !selectedStock && "text-muted-foreground"
              )}
              disabled={disabled}
            >
              {selectedStock ? (
                <span>
                  <span className="font-semibold">{selectedStock.symbol}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {selectedStock.description}
                  </span>
                </span>
              ) : (
                <span>Search for a stock...</span>
              )}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[600px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search by symbol or company name..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                <CommandEmpty>
                  {loading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Searching...</span>
                    </div>
                  ) : (
                    "No stocks found."
                  )}
                </CommandEmpty>
                
                {!search && (
                  <CommandGroup heading="Popular Stocks">
                    {popularStocks.map((stock) => (
                      <CommandItem
                        key={stock.symbol}
                        value={stock.symbol}
                        onSelect={() => handleSelect({ ...stock, type: 'Common Stock' })}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <span className="font-semibold">{stock.symbol}</span>
                            <span className="ml-2 text-sm text-muted-foreground">
                              {stock.description}
                            </span>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {stocks.length > 0 && (
                  <CommandGroup heading="Search Results">
                    {stocks.map((stock) => (
                      <CommandItem
                        key={stock.symbol}
                        value={stock.symbol}
                        onSelect={() => handleSelect(stock)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <span className="font-semibold">{stock.symbol}</span>
                            <span className="ml-2 text-sm text-muted-foreground">
                              {stock.description}
                            </span>
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            {stock.type}
                          </Badge>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {selectedStock && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{selectedStock.symbol}</h3>
              <p className="text-sm text-muted-foreground">{selectedStock.description}</p>
            </div>
            <Badge>{selectedStock.type}</Badge>
          </div>
        </div>
      )}
    </div>
  );
}