'use client'

import Link from 'next/link'
import { Plus, MessageSquare, TrendingUp, BrainCircuit, PieChart, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export function QuickActions() {
  const t = useTranslations('dashboard.quickActions')

  const actions = [
    {
      id: 'addStock',
      title: t('actions.addStock.title'),
      description: t('actions.addStock.description'),
      icon: Plus,
      href: '/portfolio',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      hoverColor: 'hover:bg-blue-500/20',
    },
    {
      id: 'chatWithAI',
      title: t('actions.chatWithAI.title'),
      description: t('actions.chatWithAI.description'),
      icon: MessageSquare,
      href: '/finchat',
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
      hoverColor: 'hover:bg-teal-500/20',
    },
    {
      id: 'findTrades',
      title: t('actions.findTrades.title'),
      description: t('actions.findTrades.description'),
      icon: TrendingUp,
      href: '/swing-trading',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      hoverColor: 'hover:bg-green-500/20',
    },
    {
      id: 'analyzeStock',
      title: t('actions.analyzeStock.title'),
      description: t('actions.analyzeStock.description'),
      icon: BrainCircuit,
      href: '/stock-analysis',
      color: 'text-green-600',
      bgColor: 'bg-green-600/10',
      hoverColor: 'hover:bg-green-600/20',
    },
    {
      id: 'viewPortfolio',
      title: t('actions.viewPortfolio.title'),
      description: t('actions.viewPortfolio.description'),
      icon: PieChart,
      href: '/portfolio',
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
      hoverColor: 'hover:bg-blue-600/20',
    },
    {
      id: 'marketReport',
      title: t('actions.marketReport.title'),
      description: t('actions.marketReport.description'),
      icon: FileText,
      href: '/finchat',
      color: 'text-teal-600',
      bgColor: 'bg-teal-600/10',
      hoverColor: 'hover:bg-teal-600/20',
    },
  ]
  return (
    <Card className="overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/30 to-teal-50/30 dark:from-cyan-950/20 dark:to-teal-950/20" />
      <CardHeader className="relative">
        <CardTitle className="bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">{t('title')}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {t('subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
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