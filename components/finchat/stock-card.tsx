'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StockCardProps {
  symbol: string
  className?: string
}

interface StockData {
  symbol: string
  companyName: string
  currentPrice: number
  change: number
  changePercent: number
  volume?: number
}

export function StockCard({ symbol, className }: StockCardProps) {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchStockData()
  }, [symbol])

  const fetchStockData = async () => {
    try {
      setLoading(true)
      setError(false)
      
      // In a real implementation, this would fetch from the API
      // For now, we'll simulate with mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock data - replace with actual API call
      const mockData: StockData = {
        symbol: symbol.toUpperCase(),
        companyName: getCompanyName(symbol),
        currentPrice: 100 + Math.random() * 200,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 10000000)
      }
      
      setStockData(mockData)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const getCompanyName = (symbol: string): string => {
    const companies: Record<string, string> = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'AMZN': 'Amazon.com Inc.',
      'TSLA': 'Tesla, Inc.',
      'META': 'Meta Platforms Inc.',
      'NVDA': 'NVIDIA Corporation'
    }
    return companies[symbol.toUpperCase()] || symbol.toUpperCase()
  }

  if (loading) {
    return (
      <Card className={cn("p-3 flex items-center gap-2", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </Card>
    )
  }

  if (error || !stockData) {
    return (
      <Card className={cn("p-3", className)}>
        <p className="text-sm text-muted-foreground">Unable to load {symbol}</p>
      </Card>
    )
  }

  const isPositive = stockData.change >= 0

  return (
    <Card className={cn("p-3 hover:bg-accent transition-colors cursor-pointer", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{stockData.symbol}</h4>
            <Badge variant="outline" className="text-xs">
              {stockData.companyName}
            </Badge>
          </div>
          <p className="text-lg font-semibold mt-1">
            ${stockData.currentPrice.toFixed(2)}
          </p>
        </div>
        
        <div className="text-right">
          <div className={cn(
            "flex items-center gap-1",
            isPositive ? "text-green-600" : "text-red-600"
          )}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="font-medium">
              {isPositive ? '+' : ''}{stockData.changePercent.toFixed(2)}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {isPositive ? '+' : ''}{stockData.change.toFixed(2)}
          </p>
        </div>
      </div>
      
      {stockData.volume && (
        <p className="text-xs text-muted-foreground mt-2">
          Vol: {(stockData.volume / 1000000).toFixed(2)}M
        </p>
      )}
    </Card>
  )
}