'use client'

import { useEffect, useRef } from 'react'
import { Database, Brain, Cpu, Shield, Globe, FileText, TrendingUp, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'

export function ArchitectureDiagram() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('landing.architecture')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = canvasRef.current?.querySelectorAll('.diagram-element')
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Cpu className="mr-2 h-3 w-3" />
            {t('badge') || 'Advanced Architecture'}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div ref={canvasRef} className="relative">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Data Sources */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 text-center">{t('dataSources.title')}</h3>
              
              <Card className="diagram-element p-4 opacity-0 transition-all duration-500 translate-x-[-20px]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Globe className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">{t('dataSources.items.0')}</p>
                    <p className="text-sm text-muted-foreground">{t('dataSources.descriptions.0') || 'Real-time prices & volumes'}</p>
                  </div>
                </div>
              </Card>

              <Card className="diagram-element p-4 opacity-0 transition-all duration-500 delay-100 translate-x-[-20px]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                    <FileText className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">{t('dataSources.items.1')}</p>
                    <p className="text-sm text-muted-foreground">{t('dataSources.descriptions.1') || 'SEC filings & reports'}</p>
                  </div>
                </div>
              </Card>

              <Card className="diagram-element p-4 opacity-0 transition-all duration-500 delay-200 translate-x-[-20px]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <Database className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">{t('dataSources.items.2')}</p>
                    <p className="text-sm text-muted-foreground">{t('dataSources.descriptions.2') || 'Global news analysis'}</p>
                  </div>
                </div>
              </Card>

              <Card className="diagram-element p-4 opacity-0 transition-all duration-500 delay-300 translate-x-[-20px]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium">{t('dataSources.items.3')}</p>
                    <p className="text-sm text-muted-foreground">{t('dataSources.descriptions.3') || 'Charts & patterns'}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Processing Layer */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 text-center">{t('processing.title')}</h3>
              
              <Card className="diagram-element p-6 opacity-0 transition-all duration-500 delay-400 scale-95 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="text-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
                    <Cpu className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{t('processing.title')}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {t('processing.description') || 'Data normalization, validation, and enrichment'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    <Badge variant="secondary" className="text-xs">{t('processing.items.0') || 'Deduplication'}</Badge>
                    <Badge variant="secondary" className="text-xs">{t('processing.items.1') || 'Validation'}</Badge>
                    <Badge variant="secondary" className="text-xs">{t('processing.items.2') || 'Normalization'}</Badge>
                    <Badge variant="secondary" className="text-xs">{t('processing.items.3') || 'Enrichment'}</Badge>
                  </div>
                </div>
              </Card>

              <Card className="diagram-element p-6 opacity-0 transition-all duration-500 delay-500 scale-95">
                <div className="text-center space-y-3">
                  <Shield className="h-8 w-8 text-primary mx-auto" />
                  <p className="font-medium">Security Layer</p>
                  <p className="text-xs text-muted-foreground">Encryption & compliance</p>
                </div>
              </Card>
            </div>

            {/* AI Analysis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 text-center">{t('aiAnalysis.title')}</h3>
              
              <Card className="diagram-element p-6 opacity-0 transition-all duration-500 delay-600 translate-x-[20px] bg-gradient-to-br from-teal-500/5 to-blue-500/5 border-teal-500/20">
                <div className="text-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 mx-auto">
                    <Brain className="h-8 w-8 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{t('aiAnalysis.title')}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {t('aiAnalysis.description') || '5 specialized investment agents analyzing in parallel'}
                    </p>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-2">
                <Card className="diagram-element p-3 opacity-0 transition-all duration-500 delay-700 translate-x-[20px]">
                  <p className="text-xs font-medium">{t('aiAnalysis.shortTerm') || 'Short-term Trading'}</p>
                  <p className="text-xs text-muted-foreground">{t('aiAnalysis.shortTermDuration') || '1-30 days'}</p>
                </Card>
                <Card className="diagram-element p-3 opacity-0 transition-all duration-500 delay-800 translate-x-[20px]">
                  <p className="text-xs font-medium">{t('aiAnalysis.longTerm') || 'Long-term Investing'}</p>
                  <p className="text-xs text-muted-foreground">{t('aiAnalysis.longTermDuration') || '1-10+ years'}</p>
                </Card>
              </div>

              <Card className="diagram-element p-4 opacity-0 transition-all duration-500 delay-900 translate-x-[20px] border-green-500/20 bg-green-500/5">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">{t('output.title')}</p>
                    <p className="text-sm text-muted-foreground">{t('output.items.0')}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Animated connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(20, 184, 166)" stopOpacity="0" />
                <stop offset="50%" stopColor="rgb(20, 184, 166)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="rgb(20, 184, 166)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 33% 50% Q 50% 45% 67% 50%"
              fill="none"
              stroke="url(#gradient1)"
              strokeWidth="2"
              className="animate-pulse"
            />
          </svg>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 rounded-full bg-primary/10 px-6 py-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium">{t('performance.processing') || 'Processing 1M+ data points/second'}</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm font-medium">{t('performance.latency')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}