'use client'

import { AlertTriangle, Shield, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ComponentRenderProps, RiskAssessmentData } from '@/lib/types/finchat'
import { cn } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export default function RiskAssessmentCard({ data, className }: ComponentRenderProps<RiskAssessmentData>) {
  if (!data) return null

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-50 dark:bg-green-950/30'
      case 'medium':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/30'
      case 'high':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-950/30'
      case 'very-high':
        return 'text-red-600 bg-red-50 dark:bg-red-950/30'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/30'
    }
  }

  const getRiskIcon = () => {
    if (data.riskScore < 30) return <Shield className="h-5 w-5 text-green-600" />
    if (data.riskScore < 70) return <AlertTriangle className="h-5 w-5 text-amber-600" />
    return <AlertTriangle className="h-5 w-5 text-red-600" />
  }

  // Prepare data for pie chart
  const pieData = data.factors.map(factor => ({
    name: factor.name,
    value: Math.abs(factor.weight),
    impact: factor.impact
  }))

  const COLORS = {
    positive: '#10b981',
    negative: '#ef4444'
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getRiskIcon()}
            Risk Assessment - {data.symbol}
          </CardTitle>
          <Badge className={cn("capitalize", getRiskColor(data.riskLevel))}>
            {data.riskLevel.replace('-', ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Risk Score */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Overall Risk Score</span>
            <span className="font-medium">{data.riskScore}/100</span>
          </div>
          <Progress 
            value={data.riskScore} 
            className="h-3"
            style={{
              background: `linear-gradient(to right, 
                hsl(var(--success)) 0%, 
                hsl(var(--warning)) 50%, 
                hsl(var(--destructive)) 100%)`
            }}
          />
        </div>

        {/* Risk Factors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Risk Factors</h4>
            <div className="space-y-1">
              {data.factors.map((factor, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  {factor.impact === 'positive' ? (
                    <TrendingDown className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-red-600" />
                  )}
                  <span className="flex-1">{factor.name}</span>
                  <span className={cn(
                    "font-medium",
                    factor.impact === 'positive' ? "text-green-600" : "text-red-600"
                  )}>
                    {factor.weight}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Factor Distribution Chart */}
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.impact as keyof typeof COLORS]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volatility Metrics */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Volatility Analysis</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="text-muted-foreground">Daily</div>
              <div className="font-medium">{data.volatility.daily.toFixed(2)}%</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="text-muted-foreground">Weekly</div>
              <div className="font-medium">{data.volatility.weekly.toFixed(2)}%</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="text-muted-foreground">Monthly</div>
              <div className="font-medium">{data.volatility.monthly.toFixed(2)}%</div>
            </div>
          </div>
        </div>

        {/* Beta */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
          <div>
            <span className="text-sm font-medium">Beta</span>
            <span className="text-xs text-muted-foreground ml-2">(Market Correlation)</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {data.beta.toFixed(2)}
          </Badge>
        </div>

        {/* Recommendation */}
        <div className="p-3 rounded-lg bg-muted/50">
          <h4 className="text-sm font-medium mb-1">Risk Management Recommendation</h4>
          <p className="text-xs text-muted-foreground">{data.recommendation}</p>
        </div>
      </CardContent>
    </Card>
  )
}