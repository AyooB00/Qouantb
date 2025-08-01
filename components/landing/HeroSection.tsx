'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { ArrowRight, TrendingUp, TrendingDown, Activity, Sparkles, Brain, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Mock real-time stock data
const stockTickers = [
  { symbol: 'AAPL', price: 182.52, change: 2.34, percent: 1.3 },
  { symbol: 'MSFT', price: 378.91, change: -1.23, percent: -0.32 },
  { symbol: 'GOOGL', price: 142.65, change: 3.45, percent: 2.48 },
  { symbol: 'TSLA', price: 201.12, change: 5.67, percent: 2.9 },
  { symbol: 'NVDA', price: 495.22, change: -2.11, percent: -0.42 },
]

export function HeroSection() {
  const [currentTickerIndex, setCurrentTickerIndex] = useState(0)
  const [tradingTypeIndex, setTradingTypeIndex] = useState(0)
  const t = useTranslations('landing.hero')
  const locale = useLocale()

  const tradingTypes = [
    t('tradingTypes.shortTerm'),
    t('tradingTypes.longTerm'),
    t('tradingTypes.swing'),
    t('tradingTypes.value')
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTickerIndex((prev) => (prev + 1) % stockTickers.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTradingTypeIndex((prev) => (prev + 1) % tradingTypes.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const currentTicker = stockTickers[currentTickerIndex]
  const isPositive = currentTicker.change > 0

  return (
    <section className="relative pb-16 pt-8 md:pb-24 md:pt-16 lg:pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-purple-500/20 to-teal-500/20 blur-3xl" />
      </div>

      <div className="flex flex-col items-center gap-8 text-center">
        {/* Live ticker badge */}
        <div className="animate-fade-in">
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
            <Brain className="mr-2 h-3 w-3 animate-pulse text-teal-500" />
            {t('badge')}
          </Badge>
        </div>

        {/* Main headline */}
        <div className="space-y-4 animate-fade-in">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">{t('title')}</span>
            <span className="block h-[1.2em] relative overflow-hidden">
              <span 
                className="absolute inset-0 transition-transform duration-700 ease-in-out" 
                style={{ transform: `translateY(${-tradingTypeIndex * 100}%)` }}
              >
                {tradingTypes.map((type, index) => (
                  <span 
                    key={type} 
                    className="block h-[1.2em] flex items-center justify-center bg-gradient-to-r from-teal-600 via-teal-500 to-blue-500 bg-clip-text text-transparent"
                  >
                    {type}
                  </span>
                ))}
              </span>
            </span>
          </h1>
          
          <p className="mx-auto max-w-[800px] text-lg text-muted-foreground sm:text-xl">
            {t('subtitle')}
          </p>
        </div>

        {/* Live stock ticker showcase */}
        <div className="w-full max-w-md animate-fade-in animation-delay-200">
          <div className="rounded-lg border bg-card p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20">
                  <TrendingUp className="h-5 w-5 text-teal-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">{currentTicker.symbol}</p>
                  <p className="text-sm text-muted-foreground">{t('aiAnalysis')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${currentTicker.price}</p>
                <div className="flex items-center justify-end gap-1">
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={cn(
                    "text-sm font-medium",
                    isPositive ? "text-green-500" : "text-red-500"
                  )}>
                    {isPositive ? '+' : ''}{currentTicker.percent}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {t('agentsAnalyzing', { count: 5 })} • {t('realTimeDetection')}
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-4 sm:flex-row animate-fade-in animation-delay-400">
          <Button size="lg" asChild className="group">
            <Link href={`/${locale}/dashboard`}>
              <Sparkles className="mr-2 h-4 w-4" />
              {t('cta.startFree')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={`/${locale}/stock-analysis`}>
              {t('cta.seeAgents')}
            </Link>
          </Button>
        </div>

        {/* Trust indicators for funds */}
        <div className="mt-8 animate-fade-in animation-delay-600">
          <p className="text-sm text-muted-foreground mb-4">{t('trust.title')}</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex flex-col items-center">
              <p className="text-3xl font-bold">50+</p>
              <p className="text-sm text-muted-foreground">{t('trust.funds')}</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col items-center">
              <p className="text-3xl font-bold">$2.5B+</p>
              <p className="text-sm text-muted-foreground">{t('trust.assets')}</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col items-center">
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm text-muted-foreground">{t('trust.companies')}</p>
            </div>
          </div>
        </div>

        {/* Security badge for funds */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground animate-fade-in animation-delay-800">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>{t('security.encryption')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span>{t('security.speed')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>{t('security.monitoring')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}