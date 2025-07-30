'use client'

import { useEffect, useState } from 'react'
import { Plus, RefreshCw, TrendingUp, TrendingDown, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'
import { PortfolioOverview } from '@/components/portfolio/portfolio-overview'
import { HoldingCard } from '@/components/portfolio/holding-card'
import { AddStockDialog } from '@/components/portfolio/add-stock-dialog'
import { PortfolioInsights } from '@/components/portfolio/portfolio-insights'
import { RiskAnalysis } from '@/components/portfolio/risk-analysis'
import { DiversificationScore } from '@/components/portfolio/diversification-score'
import { cn } from '@/lib/utils'

export default function PortfolioPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    items,
    totalValue,
    totalProfitLoss,
    totalProfitLossPercent,
    updatePrices,
    setLoading,
    isLoading,
    initializeWithDefaults
  } = usePortfolioStore()

  // Initialize with example stocks on first load
  useEffect(() => {
    initializeWithDefaults()
  }, [])

  // Update prices on mount and periodically
  useEffect(() => {
    if (items.length > 0) {
      updateCurrentPrices()
    }

    // Update prices every 60 seconds
    const interval = setInterval(() => {
      if (items.length > 0) {
        updateCurrentPrices()
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [items.length])

  const updateCurrentPrices = async () => {
    try {
      setLoading(true)
      const symbols = items.map(item => item.symbol)
      
      // Fetch current prices for all symbols
      const pricePromises = symbols.map(async (symbol) => {
        const response = await fetch(`/api/search-stocks?q=${symbol}`)
        if (!response.ok) throw new Error(`Failed to fetch ${symbol}`)
        
        // For now, we'll use the search endpoint, but ideally we'd have a dedicated price endpoint
        // This is a placeholder - in production, we'd fetch real-time prices
        const data = await response.json()
        return { symbol, price: Math.random() * 200 + 50 } // Mock price for demo
      })

      const priceData = await Promise.all(pricePromises)
      const priceMap = priceData.reduce((acc, { symbol, price }) => {
        acc[symbol] = price
        return acc
      }, {} as Record<string, number>)

      updatePrices(priceMap)
    } catch (err) {
      console.error('Error updating prices:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAnalysis = async () => {
    if (items.length === 0) return

    setIsUpdating(true)
    setError(null)

    try {
      const symbols = items.map(item => item.symbol)
      const response = await fetch('/api/portfolio/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols })
      })

      if (!response.ok) {
        throw new Error('Failed to update analysis')
      }

      const data = await response.json()
      
      // Update each item with its analysis
      data.analyses.forEach((analysis: any) => {
        const item = items.find(i => i.symbol === analysis.symbol)
        if (item) {
          usePortfolioStore.getState().updateAnalysis(item.id, {
            timestamp: analysis.lastUpdated,
            tips: analysis.tips.map((tip: any) => tip.description),
            forecast: {
              sevenDay: analysis.forecast.predictions.sevenDay.price,
              thirtyDay: analysis.forecast.predictions.thirtyDay.price,
              confidence: (analysis.forecast.predictions.sevenDay.confidence + 
                          analysis.forecast.predictions.thirtyDay.confidence) / 2
            },
            sentiment: analysis.forecast.technicalIndicators.trend
          })
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update analysis')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Portfolio</h1>
            <p className="text-muted-foreground text-lg">
              Track your investments with AI-powered insights
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleUpdateAnalysis}
              disabled={items.length === 0 || isUpdating}
              variant="outline"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Update Analysis
                </>
              )}
            </Button>
            
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Stock
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {items.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No stocks in portfolio</h3>
              <p className="text-muted-foreground mb-4">
                Add stocks to start tracking your investments
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Stock
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Example stocks notice */}
            {items.some(item => item.id.includes('-default')) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  These are example stocks to help you get started. You can add your own stocks or clear these examples.
                </AlertDescription>
              </Alert>
            )}

            {/* Portfolio Overview */}
            <PortfolioOverview />

            {/* Smart Analytics Section */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column - Insights */}
              <div className="space-y-6">
                <PortfolioInsights />
                <DiversificationScore />
              </div>
              
              {/* Right Column - Risk */}
              <div className="space-y-6">
                <RiskAnalysis />
              </div>
            </div>

            {/* Holdings */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Holdings</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                {items.map((item) => (
                  <HoldingCard key={item.id} holding={item} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Stock Dialog */}
        <AddStockDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
        />

        <div className="mt-16 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>
            Portfolio tracking and analysis for educational purposes only. 
            Real-time prices may be delayed. Not financial advice.
          </p>
        </div>
      </div>
    </div>
  )
}