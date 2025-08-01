'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { MetricsOverview } from '@/components/dashboard/MetricsOverview'
import { InsightsWidget } from '@/components/dashboard/InsightsWidget'
import { MarketOverview } from '@/components/dashboard/MarketOverview'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const { items, initializeWithDefaults } = usePortfolioStore()

  useEffect(() => {
    // Initialize portfolio if empty
    if (items.length === 0) {
      initializeWithDefaults()
    }
  }, [items.length, initializeWithDefaults])

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-400 dark:to-blue-400 bg-clip-text text-transparent">
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t('subtitle')}
        </p>
      </div>

      {/* Metrics Overview */}
      <MetricsOverview />

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Insights & Quick Actions */}
        <div className="space-y-6 lg:col-span-2">
          <InsightsWidget />
          <QuickActions />
        </div>

        {/* Right Column - Market Overview */}
        <div className="space-y-6">
          <MarketOverview />
        </div>
      </div>
    </div>
  )
}