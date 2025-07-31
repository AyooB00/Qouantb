'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, TrendingUp, MessageSquare, BrainCircuit, Plus, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'
import { useChatStore } from '@/lib/stores/chat-store'
import { cn } from '@/lib/utils'

interface Activity {
  id: string
  type: 'portfolio' | 'chat' | 'analysis' | 'trade'
  title: string
  description: string
  timestamp: Date
  icon: any
  link?: string
  metadata?: any
}

export function RecentActivity() {
  const { items } = usePortfolioStore()
  const { conversations } = useChatStore()
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    // Generate activities based on portfolio and chat data
    const recentActivities: Activity[] = []

    // Add portfolio activities
    items.slice(0, 2).forEach((item) => {
      recentActivities.push({
        id: `portfolio-${item.id}`,
        type: 'portfolio',
        title: `Added ${item.symbol} to portfolio`,
        description: `${item.quantity} shares at $${item.avgCost}`,
        timestamp: new Date(item.addedDate),
        icon: Plus,
        link: '/portfolio',
      })
    })

    // Add chat activities
    conversations.slice(0, 2).forEach((conv) => {
      recentActivities.push({
        id: `chat-${conv.id}`,
        type: 'chat',
        title: conv.title,
        description: `${conv.messages.length} messages`,
        timestamp: new Date(conv.updatedAt),
        icon: MessageSquare,
        link: '/finchat',
      })
    })

    // Add mock analysis activity
    recentActivities.push({
      id: 'analysis-1',
      type: 'analysis',
      title: 'Analyzed NVDA',
      description: 'AI consensus: Strong Buy',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: BrainCircuit,
      link: '/stock-analysis',
      metadata: { rating: 'buy' },
    })

    // Sort by timestamp
    recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    
    setActivities(recentActivities.slice(0, 5))
  }, [items, conversations])

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'portfolio':
        return 'text-blue-500'
      case 'chat':
        return 'text-purple-500'
      case 'analysis':
        return 'text-green-500'
      case 'trade':
        return 'text-orange-500'
    }
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start by adding stocks to your portfolio or chatting with AI
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest actions and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon
            return (
              <div
                key={activity.id}
                className={cn(
                  "flex items-start gap-3 pb-4 last:pb-0 last:border-0 border-b",
                  `animate-stagger animate-stagger-${index + 1}`
                )}
              >
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full bg-muted",
                  getActivityColor(activity.type)
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {getRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                  
                  {activity.metadata?.rating && (
                    <Badge 
                      variant={activity.metadata.rating === 'buy' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {activity.metadata.rating.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t">
          <Button variant="ghost" className="w-full group" asChild>
            <Link href="/portfolio">
              View all activity
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}