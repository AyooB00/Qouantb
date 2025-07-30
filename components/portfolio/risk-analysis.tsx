'use client'

import { useEffect, useState } from 'react'
import { Shield, AlertTriangle, TrendingDown, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'
import { cn } from '@/lib/utils'

interface RiskMetrics {
  overallRisk: 'low' | 'medium' | 'high'
  riskScore: number // 0-100
  volatility: number
  beta: number
  sharpeRatio: number
  maxDrawdown: number
  concentrationRisk: {
    topHolding: string
    percentage: number
    warning: boolean
  }
  sectorConcentration: {
    sector: string
    percentage: number
    warning: boolean
  }
}

export function RiskAnalysis() {
  const { items, totalValue } = usePortfolioStore()
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null)

  useEffect(() => {
    calculateRiskMetrics()
  }, [items, totalValue])

  const calculateRiskMetrics = () => {
    if (items.length === 0) return

    // Calculate concentration risk
    const sortedByValue = [...items].sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0))
    const topHolding = sortedByValue[0]
    const topHoldingPercentage = ((topHolding.totalValue || 0) / totalValue) * 100

    // Calculate sector concentration (simplified - in real app, use actual sector data)
    const techStocks = items.filter(item => 
      ['AAPL', 'MSFT', 'NVDA', 'META'].includes(item.symbol)
    )
    const techValue = techStocks.reduce((sum, item) => sum + (item.totalValue || 0), 0)
    const techPercentage = (techValue / totalValue) * 100

    // Calculate portfolio beta (weighted average)
    const portfolioBeta = items.reduce((sum, item) => {
      const weight = (item.totalValue || 0) / totalValue
      const itemBeta = item.beta || 1.0 // Default to market beta
      return sum + (weight * itemBeta)
    }, 0)

    // Mock calculations for demo (in production, use proper formulas)
    const volatility = 15.5 // Annual volatility %
    const sharpeRatio = 1.2 // Risk-adjusted return
    const maxDrawdown = -12.5 // Maximum loss from peak

    // Calculate overall risk score (0-100)
    let riskScore = 0
    
    // Concentration risk (0-40 points)
    if (topHoldingPercentage > 30) riskScore += 40
    else if (topHoldingPercentage > 20) riskScore += 25
    else if (topHoldingPercentage > 15) riskScore += 15
    else riskScore += 5

    // Sector concentration (0-30 points)
    if (techPercentage > 60) riskScore += 30
    else if (techPercentage > 40) riskScore += 20
    else if (techPercentage > 30) riskScore += 10
    else riskScore += 5

    // Volatility (0-30 points)
    if (volatility > 25) riskScore += 30
    else if (volatility > 20) riskScore += 20
    else if (volatility > 15) riskScore += 10
    else riskScore += 5

    const overallRisk: RiskMetrics['overallRisk'] = 
      riskScore > 70 ? 'high' : 
      riskScore > 40 ? 'medium' : 
      'low'

    setMetrics({
      overallRisk,
      riskScore,
      volatility,
      beta: portfolioBeta,
      sharpeRatio,
      maxDrawdown,
      concentrationRisk: {
        topHolding: topHolding.symbol,
        percentage: topHoldingPercentage,
        warning: topHoldingPercentage > 25
      },
      sectorConcentration: {
        sector: 'Technology',
        percentage: techPercentage,
        warning: techPercentage > 50
      }
    })
  }

  if (!metrics || items.length === 0) {
    return null
  }

  const getRiskColor = (risk: RiskMetrics['overallRisk']) => {
    switch (risk) {
      case 'low':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'high':
        return 'text-red-600'
    }
  }

  const getRiskBgColor = (risk: RiskMetrics['overallRisk']) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100'
      case 'medium':
        return 'bg-yellow-100'
      case 'high':
        return 'bg-red-100'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Risk Analysis
        </CardTitle>
        <CardDescription>
          Portfolio risk metrics and warnings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Risk Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Risk Score</span>
            <Badge 
              variant="outline" 
              className={cn(getRiskBgColor(metrics.overallRisk), getRiskColor(metrics.overallRisk))}
            >
              {metrics.overallRisk.toUpperCase()}
            </Badge>
          </div>
          <Progress value={metrics.riskScore} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {metrics.riskScore}/100 - {
              metrics.overallRisk === 'low' ? 'Well-balanced portfolio' :
              metrics.overallRisk === 'medium' ? 'Moderate risk exposure' :
              'High risk - consider diversification'
            }
          </p>
        </div>

        {/* Risk Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Volatility</span>
            </div>
            <p className="text-lg font-semibold">{metrics.volatility.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Annual</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Max Drawdown</span>
            </div>
            <p className="text-lg font-semibold text-red-600">
              {metrics.maxDrawdown.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">From peak</p>
          </div>

          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Portfolio Beta</span>
            <p className="text-lg font-semibold">{metrics.beta.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">
              {metrics.beta > 1.2 ? 'High volatility' : 
               metrics.beta < 0.8 ? 'Low volatility' : 
               'Market average'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
            <p className="text-lg font-semibold">{metrics.sharpeRatio.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">
              {metrics.sharpeRatio > 1 ? 'Good risk-adjusted returns' : 'Below average'}
            </p>
          </div>
        </div>

        {/* Concentration Warnings */}
        <div className="space-y-3">
          {metrics.concentrationRisk.warning && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">High Position Concentration</p>
                <p className="text-xs text-muted-foreground">
                  {metrics.concentrationRisk.topHolding} represents {metrics.concentrationRisk.percentage.toFixed(1)}% 
                  of your portfolio. Consider reducing position size.
                </p>
              </div>
            </div>
          )}

          {metrics.sectorConcentration.warning && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Sector Concentration Risk</p>
                <p className="text-xs text-muted-foreground">
                  {metrics.sectorConcentration.percentage.toFixed(1)}% in {metrics.sectorConcentration.sector}. 
                  Diversify across sectors to reduce risk.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}