import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
)

// Dashboard components
export const MetricsOverview = dynamic(
  () => import('@/components/dashboard/MetricsOverview').then(mod => mod.MetricsOverview),
  { 
    loading: () => <LoadingSpinner />,
    ssr: true 
  }
)

export const InsightsWidget = dynamic(
  () => import('@/components/dashboard/InsightsWidget').then(mod => mod.InsightsWidget),
  { 
    loading: () => <LoadingSpinner />,
    ssr: true 
  }
)

export const MarketOverview = dynamic(
  () => import('@/components/dashboard/MarketOverview').then(mod => mod.MarketOverview),
  { 
    loading: () => <LoadingSpinner />,
    ssr: true 
  }
)

export const RecentActivity = dynamic(
  () => import('@/components/dashboard/RecentActivity').then(mod => mod.RecentActivity),
  { 
    loading: () => <LoadingSpinner />,
    ssr: true 
  }
)

// NASDAQ Market Status - Client only
export const NasdaqMarketStatus = dynamic(
  () => import('@/components/market/NasdaqMarketStatus').then(mod => mod.NasdaqMarketStatus),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
)

// FinChat components - Client only
export const ChatInterface = dynamic(
  () => import('@/components/finchat/chat-interface').then(mod => mod.ChatInterface),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
)

// Portfolio components
export const PortfolioOverview = dynamic(
  () => import('@/components/portfolio/portfolio-overview').then(mod => mod.PortfolioOverview),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
)

export const PortfolioInsights = dynamic(
  () => import('@/components/portfolio/portfolio-insights').then(mod => mod.PortfolioInsights),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
)

// Stock Analysis components
export const StockAnalysisLoadingState = dynamic(
  () => import('@/components/stock-analysis/stock-analysis-loading-state').then(mod => mod.StockAnalysisLoadingState),
  { 
    loading: () => <LoadingSpinner />,
    ssr: true 
  }
)

// Swing Trading components
export const AnalysisLoadingState = dynamic(
  () => import('@/components/swing-trading/analysis-loading-state').then(mod => mod.AnalysisLoadingState),
  { 
    loading: () => <LoadingSpinner />,
    ssr: true 
  }
)

export const ResultsGrid = dynamic(
  () => import('@/components/swing-trading/results-grid').then(mod => mod.default),
  { 
    loading: () => <LoadingSpinner />,
    ssr: true 
  }
)