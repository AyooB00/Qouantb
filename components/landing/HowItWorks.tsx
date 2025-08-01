'use client'

import { Search, Brain, TrendingUp, ArrowRight, Clock, Shield, Target } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'

type TranslationFunction = {
  (key: string): string
  raw(key: string): string[] | string
}

const getSteps = (t: TranslationFunction) => [
  {
    number: '1',
    title: t('steps.0.title'),
    description: t('steps.0.description'),
    icon: Search,
    color: 'from-blue-600 to-blue-500',
    features: t.raw('steps.0.features') || ['Single stock', 'Full portfolio', 'Market sectors'],
  },
  {
    number: '2',
    title: t('steps.1.title'),
    description: t('steps.1.description'),
    icon: Brain,
    color: 'from-teal-600 to-teal-500',
    features: t.raw('steps.1.features') || ['Warren Buffett', 'Cathie Wood', 'Ray Dalio'],
    highlight: true,
    badge: t.raw('steps.1.badge'),
  },
  {
    number: '3',
    title: t('steps.2.title'),
    description: t('steps.2.description'),
    icon: TrendingUp,
    color: 'from-green-600 to-green-500',
    features: t.raw('steps.2.features') || ['Buy/Sell signals', 'Risk analysis', 'Price targets'],
  },
]

export function HowItWorks() {
  const t = useTranslations('landing.howItWorks')
  const locale = useLocale()
  const steps = getSteps(t)
  const isRTL = locale === 'ar'

  return (
    <section className="py-16 md:py-24 lg:py-32" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Clock className="mr-2 h-3 w-3" />
            {t('badge')}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-[600px] text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Desktop Flow */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection arrows */}
            <div className="absolute top-1/2 left-0 right-0 flex justify-between px-[25%] -translate-y-1/2 z-0">
              <ArrowRight className="h-8 w-8 text-muted-foreground/30" />
              <ArrowRight className="h-8 w-8 text-muted-foreground/30" />
            </div>

            <div className="grid grid-cols-3 gap-8 relative z-10">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <Card
                    key={step.number}
                    className={cn(
                      "relative overflow-hidden transition-all hover:shadow-lg",
                      step.highlight && "ring-2 ring-primary shadow-lg",
                      `animate-stagger animate-stagger-${index + 1}`
                    )}
                  >
                    <div className="p-6">
                      {/* Step number badge */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {locale === 'ar' ? `خطوة ${step.number}` : `Step ${step.number}`}
                        </Badge>
                        {step.highlight && step.badge && (
                          <Badge variant="default" className="bg-teal-500">
                            {step.badge}
                          </Badge>
                        )}
                      </div>

                      {/* Icon */}
                      <div className={cn(
                        "flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br text-white mb-4",
                        step.color
                      )}>
                        <Icon className="h-10 w-10" />
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground mb-4">{step.description}</p>

                      {/* Features */}
                      <div className="space-y-2">
                        {(Array.isArray(step.features) ? step.features : [step.features]).map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <span className="text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Decorative gradient */}
                    <div className={cn(
                      "absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r",
                      step.color
                    )} />
                  </Card>
                )
              })}
            </div>
          </div>
        </div>

        {/* Mobile Flow */}
        <div className="lg:hidden space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <Card
                key={step.number}
                className={cn(
                  "relative overflow-hidden",
                  step.highlight && "ring-2 ring-primary shadow-lg"
                )}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white",
                      step.color
                    )}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{locale === 'ar' ? `خطوة ${step.number}` : `Step ${step.number}`}</Badge>
                        {step.highlight && step.badge && (
                          <Badge variant="default" className="bg-teal-500">
                            {step.badge}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(step.features) ? step.features : [step.features]).map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Value Propositions */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span>{t('stats.accuracy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>{t('stats.speed')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-500" />
            <span>{t('stats.trusted')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}