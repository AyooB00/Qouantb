'use client'

import { Shield, Lock, BarChart3, Users, Database, Zap, CheckCircle2, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'

const getFeatures = (t: any) => [
  {
    icon: Shield,
    title: t('features.0.title'),
    description: t('features.0.description'),
  },
  {
    icon: Database,
    title: t('features.1.title'),
    description: t('features.1.description'),
  },
  {
    icon: BarChart3,
    title: t('features.2.title'),
    description: t('features.2.description'),
  },
  {
    icon: Users,
    title: t('features.3.title'),
    description: t('features.3.description'),
  },
]

const getBenefits = (t: any) => [
  t('benefits.0'),
  t('benefits.1'),
  t('benefits.2'),
  t('benefits.3'),
  t('benefits.4'),
  t('benefits.5'),
]

export function InvestmentFundsSection() {
  const t = useTranslations('landing.enterprise')
  const locale = useLocale()
  const features = getFeatures(t)
  const benefits = getBenefits(t)

  return (
    <section className="py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <Badge variant="outline" className="mb-4">
              <Lock className="mr-2 h-3 w-3" />
              {t('badge')}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              {t('title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              {t('subtitle')}
            </p>

            <div className="space-y-3 mb-8">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href={`/${locale}/contact-sales`}>
                  {t('cta.button')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={`/${locale}/docs/enterprise`}>
                  {locale === 'ar' ? 'عرض الوثائق' : 'View Documentation'}
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="border-muted">
                  <CardHeader className="pb-3">
                    <Icon className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-8 text-center">
          <Badge variant="outline" className="mb-4">
            <Zap className="mr-2 h-3 w-3" />
            {locale === 'ar' ? 'تقنية المؤسسات' : 'Enterprise Technology'}
          </Badge>
          <h3 className="text-2xl font-bold mb-2">{t('technology.title') || 'Same Technology Used by Industry Leaders'}</h3>
          <p className="text-sm text-muted-foreground mb-6">{t('technology.stack') || 'Claude AI • Advanced Analytics • Institutional Grade'}</p>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('technology.description') || "Our AI technology stack powers analysis at the world's leading investment institutions"}
          </p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {['BlackRock', 'Vanguard', 'Fidelity', 'State Street', 'JP Morgan'].map((firm) => (
              <div key={firm} className="group">
                <div className="text-xl font-semibold text-muted-foreground/70 group-hover:text-foreground transition-colors">
                  {firm}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}