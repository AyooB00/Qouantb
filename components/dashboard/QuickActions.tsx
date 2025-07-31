'use client'

import Link from 'next/link'
import { Plus, MessageSquare, TrendingUp, BrainCircuit, PieChart, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const actions = [
  {
    title: 'Add Stock',
    description: 'Add a new stock to your portfolio',
    icon: Plus,
    href: '/portfolio',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    hoverColor: 'hover:bg-blue-500/20',
  },
  {
    title: 'Chat with AI',
    description: 'Get instant financial insights',
    icon: MessageSquare,
    href: '/finchat',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    hoverColor: 'hover:bg-teal-500/20',
  },
  {
    title: 'Find Trades',
    description: 'Discover swing trading opportunities',
    icon: TrendingUp,
    href: '/swing-trading',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    hoverColor: 'hover:bg-green-500/20',
  },
  {
    title: 'Analyze Stock',
    description: 'Get AI-powered stock analysis',
    icon: BrainCircuit,
    href: '/stock-analysis',
    color: 'text-green-600',
    bgColor: 'bg-green-600/10',
    hoverColor: 'hover:bg-green-600/20',
  },
  {
    title: 'View Portfolio',
    description: 'Check your holdings and performance',
    icon: PieChart,
    href: '/portfolio',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    hoverColor: 'hover:bg-blue-600/20',
  },
  {
    title: 'Market Report',
    description: 'Generate AI market summary',
    icon: FileText,
    href: '/finchat',
    color: 'text-teal-600',
    bgColor: 'bg-teal-600/10',
    hoverColor: 'hover:bg-teal-600/20',
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks and features at your fingertips
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button
                key={action.title}
                variant="ghost"
                className={cn(
                  "h-auto flex-col gap-2 p-4 justify-start",
                  action.bgColor,
                  action.hoverColor,
                  "transition-all duration-200 hover:scale-105",
                  `animate-stagger animate-stagger-${index + 1}`
                )}
                asChild
              >
                <Link href={action.href}>
                  <Icon className={cn("h-6 w-6", action.color)} />
                  <div className="text-center">
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {action.description}
                    </p>
                  </div>
                </Link>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}