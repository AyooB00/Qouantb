'use client'

import { useState } from 'react'
import { Brain, TrendingUp, Shield, Clock, Target, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { INVESTMENT_AGENTS } from '@/lib/agents/investment-agents'
import { useTranslations, useLocale } from 'next-intl'

const agentIcons = {
  buffett: Shield,
  'cathie-wood': Sparkles,
  lynch: Target,
  dalio: Brain,
  graham: TrendingUp,
}

const riskColors = {
  conservative: 'text-green-500 bg-green-500/10',
  moderate: 'text-yellow-500 bg-yellow-500/10',
  aggressive: 'text-red-500 bg-red-500/10',
}

const timeHorizonLabels = {
  'very-long': '10+ years',
  'long': '5-10 years',
  'medium': '2-5 years',
  'short': '6-12 months',
}

const timeHorizonLabelsAr = {
  'very-long': '10+ سنوات',
  'long': '5-10 سنوات',
  'medium': '2-5 سنوات',
  'short': '6-12 شهر',
}

export function AIAgentsShowcase() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const agents = Object.values(INVESTMENT_AGENTS)
  const t = useTranslations('landing.aiAgents')
  const locale = useLocale()

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Brain className="mr-2 h-3 w-3" />
            {t('badge')}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {agents.map((agent) => {
            const Icon = agentIcons[agent.id as keyof typeof agentIcons] || Brain
            const isSelected = selectedAgent === agent.id
            
            return (
              <Card
                key={agent.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:shadow-lg",
                  isSelected && "ring-2 ring-primary shadow-lg scale-[1.02]"
                )}
                onClick={() => setSelectedAgent(isSelected ? null : agent.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br",
                      agent.id === 'buffett' && "from-blue-600 to-blue-500",
                      agent.id === 'cathie-wood' && "from-purple-600 to-purple-500",
                      agent.id === 'lynch' && "from-green-600 to-green-500",
                      agent.id === 'dalio' && "from-orange-600 to-orange-500",
                      agent.id === 'graham' && "from-red-600 to-red-500"
                    )}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className={cn("text-xs", riskColors[agent.riskProfile])}>
                      {t(`riskProfiles.${agent.riskProfile}`)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">
                    {locale === 'ar' && t.raw(`agents.${agent.id}.name`) ? t(`agents.${agent.id}.name`) : agent.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {locale === 'ar' && t.raw(`agents.${agent.id}.style`) ? t(`agents.${agent.id}.style`) : agent.investmentStyle}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {locale === 'ar' && t.raw(`agents.${agent.id}.philosophy`) ? t(`agents.${agent.id}.philosophy`) : agent.philosophy}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{locale === 'ar' ? t(`timeHorizons.${agent.timeHorizon}`) : timeHorizonLabels[agent.timeHorizon]}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {agent.keyMetrics.length} {locale === 'ar' ? 'مؤشر' : 'Key Metrics'}
                    </Badge>
                  </div>

                  {isSelected && (
                    <div className="mt-4 pt-4 border-t space-y-3 animate-in slide-in-from-top-2">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">{t('focusAreas')}</h4>
                        <div className="flex flex-wrap gap-1">
                          {agent.focusAreas.map((area, index) => {
                            const translatedArea = locale === 'ar' && t.raw(`agents.${agent.id}.focusAreas`) 
                              ? t.raw(`agents.${agent.id}.focusAreas`)[index] 
                              : area;
                            return (
                              <Badge key={area} variant="secondary" className="text-xs">
                                {translatedArea || area}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">{t('keyMetrics')}</h4>
                        <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                          {agent.keyMetrics.slice(0, 4).map((metric, index) => {
                            const translatedMetric = locale === 'ar' && t.raw(`agents.${agent.id}.metrics`)
                              ? t.raw(`agents.${agent.id}.metrics`)[index]
                              : metric;
                            return (
                              <span key={metric}>• {translatedMetric || metric}</span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm">
            <Brain className="h-4 w-4 text-primary" />
            <span>{t('dailyAnalysis')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}