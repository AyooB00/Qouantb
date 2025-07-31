'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MetricsOverview } from '@/components/dashboard/MetricsOverview'
import { InsightsWidget } from '@/components/dashboard/InsightsWidget'
import { MarketOverview } from '@/components/dashboard/MarketOverview'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'

export default function DashboardPage() {
  const router = useRouter()
  const { items, totalValue, initializeWithDefaults } = usePortfolioStore()

  useEffect(() => {
    // Initialize portfolio if empty
    if (items.length === 0) {
      initializeWithDefaults()
    }
  }, [items.length, initializeWithDefaults])

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your financial overview.
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

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  )
}