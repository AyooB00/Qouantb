'use client'

import { Shield, Lock, BarChart3, Users, Database, Zap, CheckCircle2, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const features = [
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description: 'End-to-end encryption for all portfolio data with SOC 2 compliance',
  },
  {
    icon: Database,
    title: 'Seamless Integration',
    description: 'Connect your existing systems via API or secure file upload',
  },
  {
    icon: BarChart3,
    title: 'Portfolio Analytics',
    description: 'AI-powered insights across your entire portfolio in real-time',
  },
  {
    icon: Users,
    title: 'Multi-User Access',
    description: 'Role-based permissions for your entire investment team',
  },
]

const benefits = [
  'Analyze portfolios 100x faster than traditional methods',
  'Identify hidden risks and opportunities across holdings',
  'Get personalized recommendations based on your investment mandate',
  'Track performance against custom benchmarks',
  'Automated compliance and reporting features',
  'White-label solutions available',
]

export function InvestmentFundsSection() {
  return (
    <section className="py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <Badge variant="outline" className="mb-4">
              <Lock className="mr-2 h-3 w-3" />
              Enterprise Solutions
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Built for Investment Funds & Portfolio Managers
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Leverage our AI agents to analyze your entire portfolio, identify opportunities, 
              and make data-driven decisions faster than ever before.
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
                <Link href="/contact-sales">
                  Contact Sales
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs/enterprise">
                  View Documentation
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
              <CardHeader className="relative">
                <CardTitle className="text-2xl">Enterprise Dashboard</CardTitle>
                <CardDescription>
                  Comprehensive portfolio analysis at your fingertips
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="aspect-video rounded-lg bg-muted/50 border flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Portfolio Analytics Preview</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">$2.5B+</p>
                    <p className="text-xs text-muted-foreground">Assets Analyzed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">50+</p>
                    <p className="text-xs text-muted-foreground">Fund Clients</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">99.9%</p>
                    <p className="text-xs text-muted-foreground">Uptime SLA</p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
        </div>

        <div className="mt-16 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-8 text-center">
          <Badge variant="outline" className="mb-4">
            <Zap className="mr-2 h-3 w-3" />
            Enterprise Technology
          </Badge>
          <h3 className="text-2xl font-bold mb-2">Same Technology Used by Industry Leaders</h3>
          <p className="text-sm text-muted-foreground mb-6">Claude AI • Advanced Analytics • Institutional Grade</p>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our AI technology stack powers analysis at the world's leading investment institutions
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