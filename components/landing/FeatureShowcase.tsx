'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Bot, ChartLine, TrendingUp, Brain, Shield, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { cn } from '@/lib/utils'

// Mock data for charts
const chartData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3800 },
  { name: 'Mar', value: 4200 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 4300 },
  { name: 'Jun', value: 4800 },
]

const features = [
  {
    title: 'AI Financial Assistant',
    description: 'Chat with our AI expert for personalized market insights and investment advice.',
    icon: Bot,
    href: '/finchat',
    preview: 'chat',
    badge: 'Most Popular',
    gradient: 'from-teal-600 to-teal-500',
  },
  {
    title: 'Portfolio Analytics',
    description: 'Track performance, analyze risk, and get AI-powered optimization suggestions.',
    icon: ChartLine,
    href: '/portfolio',
    preview: 'portfolio',
    gradient: 'from-green-600 to-green-500',
  },
  {
    title: 'Stock Analysis',
    description: 'Get comprehensive analysis from legendary investor AI personas.',
    icon: Brain,
    href: '/stock-analysis',
    preview: 'analysis',
    gradient: 'from-blue-600 to-blue-500',
  },
  {
    title: 'Swing Trading',
    description: 'Discover profitable opportunities with AI-powered market scanning.',
    icon: TrendingUp,
    href: '/swing-trading',
    preview: 'trading',
    gradient: 'from-teal-500 to-green-500',
  },
]

const additionalFeatures = [
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: 'Your data is encrypted and secure',
  },
  {
    icon: Zap,
    title: 'Real-Time Data',
    description: 'Live market updates every second',
  },
]

export function FeatureShowcase() {
  const [activeTab, setActiveTab] = useState('chat')

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-muted/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Powerful Features for Smart Investors
          </h2>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
            Everything you need to analyze markets, manage portfolios, and make informed decisions.
          </p>
        </div>

        {/* Interactive Feature Tabs */}
        <div className="mb-16">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8">
              <TabsTrigger value="chat">AI Chat</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="trading">Trading</TabsTrigger>
            </TabsList>

            <div className="rounded-lg border bg-card p-8 shadow-lg">
              <TabsContent value="chat" className="mt-0 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">FinChat AI Assistant</h3>
                    <div className="space-y-3">
                      <div className="rounded-lg bg-muted p-3">
                        <p className="text-sm">What's the outlook for tech stocks this quarter?</p>
                      </div>
                      <div className="rounded-lg bg-primary/10 p-3 ml-8">
                        <p className="text-sm">Based on current market trends, tech stocks show strong momentum. Key factors include...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="portfolio" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Portfolio Performance</h3>
                    <Badge variant="default" className="bg-green-500">+12.4%</Badge>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="mt-0">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">AAPL Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Recommendation</span>
                          <Badge className="bg-green-500">BUY</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Target Price</span>
                          <span className="font-medium">$195.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Confidence</span>
                          <span className="font-medium">87%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">AI Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Strong fundamentals with growing services revenue. Recent AI initiatives position for future growth...
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="trading" className="mt-0">
                <div className="space-y-4">
                  <h3 className="font-semibold">Swing Trading Opportunities</h3>
                  <div className="space-y-3">
                    {['NVDA', 'META', 'AMZN'].map((symbol) => (
                      <div key={symbol} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{symbol}</p>
                          <p className="text-sm text-muted-foreground">Bullish momentum detected</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-500">+85%</p>
                          <p className="text-xs text-muted-foreground">Confidence</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className={cn(
                  "group relative overflow-hidden transition-all hover:shadow-lg",
                  `animate-stagger animate-stagger-${index + 1}`
                )}
              >
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-10",
                  feature.gradient
                )} />
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br text-white",
                      feature.gradient
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    {feature.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="group/btn -ml-3" asChild>
                    <Link href={feature.href}>
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional Features */}
        <div className="grid gap-8 md:grid-cols-2 max-w-2xl mx-auto">
          {additionalFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}