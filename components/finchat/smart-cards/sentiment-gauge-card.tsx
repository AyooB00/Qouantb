'use client'

import { Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ComponentRenderProps } from '@/lib/types/finchat'
import { cn } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface SentimentGaugeData {
  symbol?: string
  topic?: string
  sentiment: {
    positive: number
    negative: number
    neutral: number
  }
  sources: {
    news: number
    social: number
    analyst: number
  }
  confidence: number
  trend: 'improving' | 'declining' | 'stable'
  summary: string
}

export default function SentimentGaugeCard({ data, className }: ComponentRenderProps<SentimentGaugeData>) {
  if (!data) return null

  const overallSentiment = 
    data.sentiment.positive > data.sentiment.negative ? 'positive' :
    data.sentiment.negative > data.sentiment.positive ? 'negative' : 'neutral'

  const sentimentData = [
    { name: 'Positive', value: data.sentiment.positive, color: '#10b981' },
    { name: 'Negative', value: data.sentiment.negative, color: '#ef4444' },
    { name: 'Neutral', value: data.sentiment.neutral, color: '#6b7280' }
  ]

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getSentimentColor = () => {
    switch (overallSentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 dark:bg-green-950/30'
      case 'negative':
        return 'text-red-600 bg-red-50 dark:bg-red-950/30'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/30'
    }
  }

  // Calculate gauge angle
  const sentimentScore = data.sentiment.positive - data.sentiment.negative
  const gaugeAngle = ((sentimentScore + 100) / 200) * 180 - 90

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-teal-600" />
            Sentiment Analysis {data.symbol && `- ${data.symbol}`}
          </CardTitle>
          <Badge className={cn("capitalize", getSentimentColor())}>
            {overallSentiment}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Sentiment Gauge */}
        <div className="relative h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="70%"
                startAngle={180}
                endAngle={0}
                innerRadius={50}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Gauge Needle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-24 h-24">
              <div 
                className="absolute w-1 h-12 bg-gray-800 dark:bg-gray-200 origin-bottom left-1/2 -translate-x-1/2 bottom-1/2 transition-transform duration-500"
                style={{ transform: `translateX(-50%) rotate(${gaugeAngle}deg)` }}
              />
              <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 dark:bg-gray-200 rounded-full" />
            </div>
          </div>
          
          {/* Score Label */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
            <div className="text-2xl font-bold">{sentimentScore > 0 ? '+' : ''}{sentimentScore}</div>
            <div className="text-xs text-muted-foreground">Sentiment Score</div>
          </div>
        </div>

        {/* Sentiment Breakdown */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
            <div className="text-green-600 font-medium">{data.sentiment.positive}%</div>
            <div className="text-muted-foreground">Positive</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-900/30">
            <div className="text-gray-600 font-medium">{data.sentiment.neutral}%</div>
            <div className="text-muted-foreground">Neutral</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-950/30">
            <div className="text-red-600 font-medium">{data.sentiment.negative}%</div>
            <div className="text-muted-foreground">Negative</div>
          </div>
        </div>

        {/* Source Distribution */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Source Analysis</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">News Articles</span>
              <span className="font-medium">{data.sources.news}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-teal-600" style={{ width: `${data.sources.news}%` }} />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Social Media</span>
              <span className="font-medium">{data.sources.social}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-teal-600" style={{ width: `${data.sources.social}%` }} />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Analyst Reports</span>
              <span className="font-medium">{data.sources.analyst}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-teal-600" style={{ width: `${data.sources.analyst}%` }} />
            </div>
          </div>
        </div>

        {/* Trend and Confidence */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <span className="text-sm">Trend:</span>
            {getTrendIcon()}
            <span className="text-sm font-medium capitalize">{data.trend}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Confidence:</span>
            <span className="ml-1 font-medium">{data.confidence}%</span>
          </div>
        </div>

        {/* Summary */}
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-sm">{data.summary}</p>
        </div>
      </CardContent>
    </Card>
  )
}