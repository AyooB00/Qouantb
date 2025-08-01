'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, RefreshCw, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'
import { PortfolioOverview } from '@/components/portfolio/portfolio-overview'
import { HoldingCard } from '@/components/portfolio/holding-card'
import { AddStockDialog } from '@/components/portfolio/add-stock-dialog'
import { PortfolioInsights } from '@/components/portfolio/portfolio-insights'
import { RiskAnalysis } from '@/components/portfolio/risk-analysis'
import { DiversificationScore } from '@/components/portfolio/diversification-score'
import { PageLoader } from '@/components/ui/page-loader'

export default function PortfolioPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const t = useTranslations('portfolio')
  const tCommon = useTranslations('common')
  const isUpdatingPrices = useRef(false)
  const updateInterval = useRef<NodeJS.Timeout | null>(null)
  
  const {
    items,
    updatePrices,
    setLoading,
    initializeWithDefaults
  } = usePortfolioStore()

  const updateCurrentPrices = useCallback(async () => {
    // Prevent multiple simultaneous updates
    if (isUpdatingPrices.current) {
      return
    }
    
    isUpdatingPrices.current = true
    
    try {
      setLoading(true)
      const symbols = items.map(item => item.symbol)
      
      // Fetch current prices for all symbols
      const pricePromises = symbols.map(async (symbol) => {
        try {
          const response = await fetch(`/api/finchat/stock-quote?symbol=${symbol}`)
          if (!response.ok) {
            console.error(`Failed to fetch ${symbol}`)
            return { symbol, price: items.find(i => i.symbol === symbol)?.currentPrice || 0 }
          }
          
          const data = await response.json()
          // Extract current price from the Finnhub quote data
          const price = data.quote?.c || data.quote?.pc || items.find(i => i.symbol === symbol)?.currentPrice || 0
          return { symbol, price }
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error)
          // Fall back to current price if fetch fails
          return { symbol, price: items.find(i => i.symbol === symbol)?.currentPrice || 0 }
        }
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
      isUpdatingPrices.current = false
    }
  }, [items, setLoading, updatePrices])

  // Initialize with example stocks on first load
  useEffect(() => {
    initializeWithDefaults()
    // Add a small delay to show loading animation
    const timer = setTimeout(() => {
      setIsPageLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [initializeWithDefaults])

  // Initial price update when component mounts
  useEffect(() => {
    if (items.length > 0 && !isPageLoading) {
      updateCurrentPrices()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageLoading]) // Run after page loading is complete
  
  // Set up interval for periodic updates
  useEffect(() => {
    // Clear any existing interval
    if (updateInterval.current) {
      clearInterval(updateInterval.current)
    }
    
    // Only set up interval if we have items
    if (items.length > 0) {
      updateInterval.current = setInterval(() => {
        updateCurrentPrices()
      }, 60000) // Update every 60 seconds
    }

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current)
        updateInterval.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]) // Only re-run when items count changes

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

      interface AnalysisResponse {
        analyses: Array<{
          symbol: string
          lastUpdated: string
          tips: Array<{ description: string }>
          forecast: {
            predictions: {
              sevenDay: { price: number; confidence: number }
              thirtyDay: { price: number; confidence: number }
            }
            technicalIndicators: {
              trend: 'bullish' | 'bearish' | 'neutral'
            }
          }
        }>
      }

      const data: AnalysisResponse = await response.json()
      
      // Update each item with its analysis
      data.analyses.forEach((analysis) => {
        const item = items.find(i => i.symbol === analysis.symbol)
        if (item) {
          usePortfolioStore.getState().updateAnalysis(item.id, {
            timestamp: analysis.lastUpdated,
            tips: analysis.tips.map((tip) => tip.description),
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

  if (isPageLoading) {
    return <PageLoader />
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-400 dark:to-blue-400 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('subtitle')}
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
                  {tCommon('loading')}
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t('updateAnalysis')}
                </>
              )}
            </Button>
            
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('addStock')}
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
          <Card className="text-center py-16 bg-gradient-to-br from-teal-50/50 to-blue-50/50 dark:from-teal-950/20 dark:to-blue-950/20 border-dashed">
            <CardContent>
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900/50 dark:to-blue-900/50 flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                {t('noHoldings')}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {t('noHoldings')}
              </p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('addStock')}
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
                  {t('exampleStocksNotice')}
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
              <h2 className="text-2xl font-semibold mb-4">{t('holdings')}</h2>
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
          {t('disclaimer')}
        </p>
      </div>
    </div>
  )
}