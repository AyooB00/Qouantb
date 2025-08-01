'use client'

import Image from 'next/image'
import { Shield, Zap, Brain, Database, Cloud, Lock, Sparkles, Globe, Server, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'

const technologies = [
  {
    name: 'OpenAI GPT-4',
    description: 'Advanced language model for market insights',
    icon: Brain,
    category: 'AI Model',
    color: 'from-green-600 to-green-500',
  },
  {
    name: 'Google Gemini',
    description: 'Multi-modal AI for comprehensive analysis',
    icon: Brain,
    category: 'AI Model',
    color: 'from-blue-600 to-blue-500',
  },
  {
    name: 'Bloomberg & Reuters',
    description: 'Professional-grade financial data feeds',
    icon: Globe,
    category: 'Data Source',
    color: 'from-orange-600 to-orange-500',
  },
  {
    name: 'Finnhub & Alpha Vantage',
    description: 'Real-time market data and indicators',
    icon: Database,
    category: 'Data Source',
    color: 'from-purple-600 to-purple-500',
  },
  {
    name: 'High-Performance Infrastructure',
    description: 'Distributed computing for parallel analysis',
    icon: Server,
    category: 'Infrastructure',
    color: 'from-red-600 to-red-500',
  },
  {
    name: 'Enterprise Security',
    description: 'SOC 2 compliant with AES-256 encryption',
    icon: Lock,
    category: 'Security',
    color: 'from-gray-600 to-gray-500',
  },
]

const stats = [
  { label: 'AI Models Active', value: '3', icon: Brain },
  { label: 'Companies Analyzed', value: '500+/day', icon: Activity },
  { label: 'Analysis Speed', value: '<100ms', icon: Zap },
  { label: 'Accuracy Rate', value: '94%+', icon: Shield },
]

export function TechStack() {
  const t = useTranslations('landing.techStack')

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Sparkles className="mr-2 h-3 w-3" />
            {t('badge') || 'AI-Powered Infrastructure'}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Claude AI Hero Card */}
        <Card className="mb-12 overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 items-center">
              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-blue-600">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Claude AI</h3>
                    <p className="text-sm text-muted-foreground">{t('claude.byAnthropic') || 'by Anthropic'}</p>
                  </div>
                </div>
                <p className="text-lg mb-6">
                  {t('claude.description') || "The core intelligence behind our investment analysis platform. Claude's advanced reasoning capabilities power our AI agents to analyze financial data, understand market context, and provide nuanced investment insights."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge>{t('claude.features.0') || 'Advanced Reasoning'}</Badge>
                  <Badge>{t('claude.features.1') || 'Financial Analysis'}</Badge>
                  <Badge>{t('claude.features.2') || 'Multi-Agent System'}</Badge>
                  <Badge>{t('claude.features.3') || 'Real-time Processing'}</Badge>
                </div>
              </div>
              <div className="relative h-full min-h-[300px] bg-gradient-to-br from-teal-500/20 to-blue-500/20 p-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                <div className="relative">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="animate-pulse">
                      <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur" />
                    </div>
                    <div className="text-4xl font-bold text-white/80">×</div>
                    <div className="animate-pulse animation-delay-200">
                      <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur" />
                    </div>
                    <div className="text-4xl font-bold text-white/80">×</div>
                    <div className="animate-pulse animation-delay-400">
                      <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur" />
                    </div>
                  </div>
                  <p className="text-center mt-4 text-white/60 text-sm">{t('claude.collaboration') || 'Multi-Model Collaboration'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tech Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {technologies.map((tech, index) => {
            const Icon = tech.icon
            return (
              <Card
                key={tech.name}
                className={cn(
                  "group relative overflow-hidden transition-all hover:shadow-lg",
                  `animate-stagger animate-stagger-${index + 1}`
                )}
              >
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-5",
                  tech.color
                )} />
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br text-white",
                      tech.color
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{tech.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {tech.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tech.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Performance Stats */}
        <div className="rounded-lg bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-8">
          <h3 className="text-center text-xl font-semibold mb-8">
            {t('performance.title') || 'Performance Metrics'}
          </h3>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="text-center">
                  <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <Card className="text-center p-6">
            <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">{t('trust.soc2.title') || 'SOC 2 Compliant'}</h4>
            <p className="text-sm text-muted-foreground">{t('trust.soc2.description') || 'Audited security controls'}</p>
          </Card>
          <Card className="text-center p-6">
            <Lock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">{t('trust.encryption.title') || 'End-to-End Encryption'}</h4>
            <p className="text-sm text-muted-foreground">{t('trust.encryption.description') || 'Your data is always secure'}</p>
          </Card>
          <Card className="text-center p-6">
            <Activity className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">{t('trust.uptime.title') || '99.9% Uptime'}</h4>
            <p className="text-sm text-muted-foreground">{t('trust.uptime.description') || 'Reliable 24/7 operation'}</p>
          </Card>
        </div>
      </div>
    </section>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}