'use client'

import { useEffect, useState } from 'react'
import { ArrowUpDown, TrendingUp, TrendingDown, BarChart3, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ComponentRenderProps, StockComparisonData } from '@/lib/types/finchat'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function StockComparisonCard({ data, onAction, className }: ComponentRenderProps<StockComparisonData>) {
  const [stockData, setStockData] = useState<StockComparisonData | null>(data)
  const [loading, setLoading] = useState(!data)
  const [sortKey, setSortKey] = useState<keyof StockComparisonData['stocks'][0]>('changePercent')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    if (!data && data !== null) {
      fetchComparisonData()
    }
  }, [data])

  const fetchComparisonData = async () => {
    // This would fetch from API if data wasn't provided
    setLoading(false)
  }

  const handleSort = (key: keyof StockComparisonData['stocks'][0]) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('desc')
    }
  }

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <CardTitle>Loading Comparison...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stockData || !stockData.stocks || stockData.stocks.length === 0) return null

  const sortedStocks = [...stockData.stocks].sort((a, b) => {
    const aVal = a[sortKey] ?? 0
    const bVal = b[sortKey] ?? 0
    const multiplier = sortOrder === 'asc' ? 1 : -1
    return (aVal > bVal ? 1 : -1) * multiplier
  })

  const formatValue = (value: any, key: string): string => {
    if (value === null || value === undefined) return 'N/A'
    
    switch (key) {
      case 'price':
        return `$${value.toFixed(2)}`
      case 'changePercent':
      case 'dividendYield':
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
      case 'marketCap':
        return `$${(value / 1e9).toFixed(2)}B`
      case 'volume':
        return `${(value / 1e6).toFixed(2)}M`
      case 'pe':
      case 'beta':
        return value.toFixed(2)
      default:
        return value.toString()
    }
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-teal-600" />
          Stock Comparison
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <div className="space-y-3">
              {sortedStocks.map((stock) => (
                <div key={stock.symbol} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold">{stock.symbol}</div>
                      <div className="text-sm text-muted-foreground">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${stock.price.toFixed(2)}</div>
                      <div className={cn(
                        "text-sm font-medium",
                        stock.changePercent >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Vol: {(stock.volume / 1e6).toFixed(2)}M
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      MCap: ${(stock.marketCap / 1e9).toFixed(2)}B
                    </Badge>
                    {stock.pe && (
                      <Badge variant="secondary" className="text-xs">
                        P/E: {stock.pe.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="fundamentals" className="mt-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort('marketCap')}>
                      Market Cap {sortKey === 'marketCap' && <ArrowUpDown className="inline h-3 w-3 ml-1" />}
                    </TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort('pe')}>
                      P/E {sortKey === 'pe' && <ArrowUpDown className="inline h-3 w-3 ml-1" />}
                    </TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort('dividendYield')}>
                      Div Yield {sortKey === 'dividendYield' && <ArrowUpDown className="inline h-3 w-3 ml-1" />}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStocks.map((stock) => (
                    <TableRow key={stock.symbol}>
                      <TableCell className="font-medium">{stock.symbol}</TableCell>
                      <TableCell className="text-right">{formatValue(stock.marketCap, 'marketCap')}</TableCell>
                      <TableCell className="text-right">{formatValue(stock.pe, 'pe')}</TableCell>
                      <TableCell className="text-right">{formatValue(stock.dividendYield, 'dividendYield')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="mt-4">
            <div className="space-y-4">
              {sortedStocks.map((stock) => {
                const range52w = stock.weekRange52
                const currentPricePercent = range52w 
                  ? ((stock.price - range52w.low) / (range52w.high - range52w.low)) * 100
                  : 50
                
                return (
                  <div key={stock.symbol} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{stock.symbol}</span>
                      <span className={cn(
                        "text-sm font-medium",
                        stock.changePercent >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    {range52w && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>${range52w.low.toFixed(2)}</span>
                          <span className="font-medium">${stock.price.toFixed(2)}</span>
                          <span>${range52w.high.toFixed(2)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-teal-600 transition-all"
                            style={{ width: `${currentPricePercent}%` }}
                          />
                        </div>
                        <div className="text-xs text-center text-muted-foreground">52 Week Range</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
        
        {stockData.recommendation && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">AI Recommendation</p>
            <p className="text-sm text-muted-foreground mt-1">{stockData.recommendation}</p>
          </div>
        )}
        
        {onAction && (
          <div className="flex gap-2 mt-4">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onAction({ label: 'Analyze Further', action: 'analyze', data: stockData })}
            >
              Analyze Further
            </Button>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => onAction({ label: 'Add to Watchlist', action: 'watchlist', data: stockData })}
            >
              Add All to Watchlist
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}