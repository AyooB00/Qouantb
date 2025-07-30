'use client'

import { useEffect, useState } from 'react'
import { PieChart, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'
import { cn } from '@/lib/utils'

interface DiversificationMetrics {
  score: number // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  sectorDiversity: {
    count: number
    distribution: Record<string, number>
    isBalanced: boolean
  }
  marketCapDiversity: {
    large: number
    mid: number
    small: number
    isBalanced: boolean
  }
  geographicDiversity: {
    domestic: number
    international: number
    isBalanced: boolean
  }
  assetCount: {
    current: number
    recommended: number
    status: 'too-few' | 'optimal' | 'too-many'
  }
  recommendations: string[]
}

export function DiversificationScore() {
  const { items } = usePortfolioStore()
  const [metrics, setMetrics] = useState<DiversificationMetrics | null>(null)

  useEffect(() => {
    calculateDiversification()
  }, [items])

  const calculateDiversification = () => {
    if (items.length === 0) return

    // Mock sector distribution (in production, use real sector data)
    const sectorMap: Record<string, string> = {
      'AAPL': 'Technology',
      'MSFT': 'Technology',
      'TSLA': 'Consumer Discretionary',
      'JPM': 'Financial',
      'JNJ': 'Healthcare',
      'AMZN': 'Consumer Discretionary',
      'META': 'Technology',
      'NVDA': 'Technology'
    }

    const sectors = items.reduce((acc, item) => {
      const sector = sectorMap[item.symbol] || 'Other'
      acc[sector] = (acc[sector] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const sectorCount = Object.keys(sectors).length
    const sectorBalance = Math.max(...Object.values(sectors)) / items.length < 0.5

    // Calculate diversification score
    let score = 0
    const recommendations: string[] = []

    // Asset count (0-25 points)
    if (items.length >= 8 && items.length <= 20) {
      score += 25
    } else if (items.length >= 5 && items.length < 8) {
      score += 15
      recommendations.push('Add 3-5 more stocks for better diversification')
    } else if (items.length < 5) {
      score += 5
      recommendations.push('Portfolio too concentrated - add at least 3 more stocks')
    } else {
      score += 20
      recommendations.push('Consider consolidating - too many holdings to manage effectively')
    }

    // Sector diversity (0-35 points)
    if (sectorCount >= 5 && sectorBalance) {
      score += 35
    } else if (sectorCount >= 3 && sectorBalance) {
      score += 25
      recommendations.push('Diversify into 2-3 additional sectors')
    } else if (sectorCount >= 3) {
      score += 15
      recommendations.push('Rebalance sector allocation - too concentrated in one sector')
    } else {
      score += 5
      recommendations.push('Critical: Add stocks from different sectors immediately')
    }

    // Market cap diversity (0-20 points) - Mock data
    const hasLargeCap = items.some(item => ['AAPL', 'MSFT'].includes(item.symbol))
    const hasMidCap = items.some(item => ['TSLA', 'AMD'].includes(item.symbol))
    const hasSmallCap = false // Mock - no small caps in default portfolio

    if (hasLargeCap && hasMidCap && hasSmallCap) {
      score += 20
    } else if (hasLargeCap && (hasMidCap || hasSmallCap)) {
      score += 15
      recommendations.push('Add small or mid-cap stocks for size diversification')
    } else {
      score += 10
      recommendations.push('Portfolio lacks market cap diversity')
    }

    // Geographic diversity (0-20 points) - All US stocks in demo
    score += 5
    recommendations.push('Consider adding international exposure (Europe, Asia)')

    // Determine grade
    const grade: DiversificationMetrics['grade'] = 
      score >= 85 ? 'A' :
      score >= 70 ? 'B' :
      score >= 55 ? 'C' :
      score >= 40 ? 'D' : 'F'

    const assetStatus: DiversificationMetrics['assetCount']['status'] = 
      items.length < 5 ? 'too-few' :
      items.length > 25 ? 'too-many' : 'optimal'

    setMetrics({
      score,
      grade,
      sectorDiversity: {
        count: sectorCount,
        distribution: sectors,
        isBalanced: sectorBalance
      },
      marketCapDiversity: {
        large: hasLargeCap ? 70 : 0,
        mid: hasMidCap ? 25 : 0,
        small: hasSmallCap ? 5 : 0,
        isBalanced: hasLargeCap && hasMidCap
      },
      geographicDiversity: {
        domestic: 100,
        international: 0,
        isBalanced: false
      },
      assetCount: {
        current: items.length,
        recommended: items.length < 8 ? 10 : items.length,
        status: assetStatus
      },
      recommendations: recommendations.slice(0, 3) // Top 3 recommendations
    })
  }

  if (!metrics || items.length === 0) {
    return null
  }

  const getGradeColor = (grade: DiversificationMetrics['grade']) => {
    switch (grade) {
      case 'A':
        return 'text-green-600 bg-green-100'
      case 'B':
        return 'text-blue-600 bg-blue-100'
      case 'C':
        return 'text-yellow-600 bg-yellow-100'
      case 'D':
        return 'text-orange-600 bg-orange-100'
      case 'F':
        return 'text-red-600 bg-red-100'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Diversification Analysis
        </CardTitle>
        <CardDescription>
          How well-balanced is your portfolio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center">
            <div className={cn(
              "text-4xl font-bold w-20 h-20 rounded-full flex items-center justify-center",
              getGradeColor(metrics.grade)
            )}>
              {metrics.grade}
            </div>
          </div>
          <div className="space-y-2">
            <Progress value={metrics.score} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Diversification Score: {metrics.score}/100
            </p>
          </div>
        </div>

        {/* Metrics Breakdown */}
        <div className="space-y-4">
          {/* Asset Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Number of Holdings</span>
              {metrics.assetCount.status === 'optimal' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
            </div>
            <Badge variant={metrics.assetCount.status === 'optimal' ? 'default' : 'secondary'}>
              {metrics.assetCount.current} stocks
            </Badge>
          </div>

          {/* Sector Diversity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sector Coverage</span>
                {metrics.sectorDiversity.isBalanced ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
              <Badge variant="outline">
                {metrics.sectorDiversity.count} sectors
              </Badge>
            </div>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(metrics.sectorDiversity.distribution).map(([sector, count]) => (
                <Badge key={sector} variant="secondary" className="text-xs">
                  {sector} ({count})
                </Badge>
              ))}
            </div>
          </div>

          {/* Geographic Diversity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Geographic Exposure</span>
              {metrics.geographicDiversity.isBalanced ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <Badge variant="secondary">
              {metrics.geographicDiversity.domestic}% US
            </Badge>
          </div>
        </div>

        {/* Recommendations */}
        {metrics.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recommendations</h4>
            <ul className="space-y-1">
              {metrics.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}