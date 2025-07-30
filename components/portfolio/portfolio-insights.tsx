'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Lightbulb, 
  Activity,
  Eye,
  Loader2,
  RefreshCw,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DailyPortfolioInsights, PortfolioInsight } from '@/lib/types/portfolio'
import { cn } from '@/lib/utils'

export function PortfolioInsights() {
  const [insights, setInsights] = useState<DailyPortfolioInsights | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/portfolio/insights')
      if (!response.ok) throw new Error('Failed to fetch insights')
      
      const data = await response.json()
      setInsights(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights')
    } finally {
      setIsLoading(false)
    }
  }

  const getInsightIcon = (type: PortfolioInsight['type']) => {
    switch (type) {
      case 'performance':
        return Activity
      case 'risk':
        return AlertCircle
      case 'opportunity':
        return Lightbulb
      case 'rebalancing':
        return RefreshCw
      case 'news':
        return Eye
      default:
        return Activity
    }
  }

  const getImpactColor = (impact: PortfolioInsight['impact']) => {
    switch (impact) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      case 'neutral':
        return 'text-muted-foreground'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error || !insights) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Failed to load insights'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI Portfolio Insights</CardTitle>
            <CardDescription>
              Personalized analysis and recommendations
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchInsights}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="insights" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="watchlist">Tomorrow</TabsTrigger>
          </TabsList>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            {/* Market Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Market Summary</h4>
              <p className="text-sm text-muted-foreground">
                {insights.marketSummary}
              </p>
            </div>

            {/* AI Insights */}
            <div className="space-y-3">
              {insights.insights.map((insight, index) => {
                const Icon = getInsightIcon(insight.type)
                return (
                  <div
                    key={index}
                    className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-full",
                          insight.impact === 'positive' ? 'bg-green-100' :
                          insight.impact === 'negative' ? 'bg-red-100' :
                          'bg-muted'
                        )}>
                          <Icon className={cn("h-4 w-4", getImpactColor(insight.impact))} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {insight.description}
                          </p>
                          {insight.actionable && insight.suggestedAction && (
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                Action Required
                              </Badge>
                              <span className="text-xs text-primary">
                                {insight.suggestedAction}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant={
                        insight.priority === 'high' ? 'destructive' :
                        insight.priority === 'medium' ? 'default' :
                        'secondary'
                      }>
                        {insight.priority}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            {/* Daily Performance */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Daily Return</p>
                <p className={cn(
                  "text-2xl font-bold",
                  insights.performanceAnalysis.dailyReturn >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {insights.performanceAnalysis.dailyReturn >= 0 ? '+' : ''}
                  {insights.performanceAnalysis.dailyReturn.toFixed(2)}%
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">vs S&P 500</p>
                <p className={cn(
                  "text-2xl font-bold",
                  insights.performanceAnalysis.vsMarket >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {insights.performanceAnalysis.vsMarket >= 0 ? '+' : ''}
                  {insights.performanceAnalysis.vsMarket.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Top Movers */}
            <div>
              <h4 className="text-sm font-medium mb-3">Top Movers Today</h4>
              <div className="space-y-2">
                {insights.topMovers.map((mover, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {mover.change >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{mover.symbol}</p>
                        <p className="text-xs text-muted-foreground">{mover.reason}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "font-bold",
                      mover.change >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {mover.change >= 0 ? '+' : ''}{mover.change.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tomorrow's Watchlist */}
          <TabsContent value="watchlist" className="space-y-4">
            <div className="space-y-3">
              {insights.tomorrowWatchlist.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.symbol}</h4>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">{item.reason}</p>
                      <p className="text-xs text-primary mt-2">
                        Expected: {item.expectedImpact}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}