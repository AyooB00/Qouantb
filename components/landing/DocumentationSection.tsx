'use client'

import { BookOpen, Shield, Rocket, Users, HelpCircle, FileText, Video } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'

const docCategories = [
  {
    title: 'Getting Started',
    icon: Rocket,
    description: 'Quick start guides and tutorials',
    items: [
      { title: 'Create Your Account', href: '/docs/getting-started/signup' },
      { title: 'First Portfolio Setup', href: '/docs/getting-started/portfolio' },
      { title: 'Understanding AI Agents', href: '/docs/getting-started/ai-agents' },
      { title: 'Making Your First Trade', href: '/docs/getting-started/first-trade' },
    ],
  },
  {
    title: 'Using Our Services',
    icon: BookOpen,
    description: 'Detailed guides for each feature',
    items: [
      { title: 'AI Stock Analysis', href: '/docs/services/stock-analysis' },
      { title: 'Portfolio Management', href: '/docs/services/portfolio' },
      { title: 'Swing Trading Signals', href: '/docs/services/swing-trading' },
      { title: 'FinChat Assistant', href: '/docs/services/finchat' },
    ],
  },
  {
    title: 'For Investment Funds',
    icon: Users,
    description: 'Enterprise integration and APIs',
    items: [
      { title: 'API Documentation', href: '/docs/enterprise/api' },
      { title: 'Bulk Data Import', href: '/docs/enterprise/data-import' },
      { title: 'Security & Compliance', href: '/docs/enterprise/security' },
      { title: 'White Label Options', href: '/docs/enterprise/white-label' },
    ],
  },
  {
    title: 'Security & Privacy',
    icon: Shield,
    description: 'Data protection and encryption',
    items: [
      { title: 'Data Encryption', href: '/docs/security/encryption' },
      { title: 'Privacy Policy', href: '/docs/security/privacy' },
      { title: 'Local LLMs for Secure Data', href: '/docs/security/local-llms' },
      { title: 'Access Controls', href: '/docs/security/access' },
    ],
  },
]

const videoTutorials = [
  { title: 'Platform Overview', duration: '5 min', views: '12.3k' },
  { title: 'Using AI Agents', duration: '8 min', views: '9.8k' },
  { title: 'Portfolio Analytics', duration: '6 min', views: '7.2k' },
  { title: 'API Integration', duration: '12 min', views: '4.5k' },
]

export function DocumentationSection() {
  const t = useTranslations('landing.documentation')
  const locale = useLocale()

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-muted/30 to-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <FileText className="mr-2 h-3 w-3" />
            {t('badge') || 'Comprehensive Documentation'}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {docCategories.map((category) => {
            const Icon = category.icon
            return (
              <Card key={category.title} className="group hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{t(`sections.${docCategories.indexOf(category)}.title`) || category.title}</CardTitle>
                  <CardDescription>{t(`sections.${docCategories.indexOf(category)}.description`) || category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.items.map((item) => (
                      <li key={item.title}>
                        <Link
                          href={item.href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {t.raw(`sections.${docCategories.indexOf(category)}.items`)?.[category.items.indexOf(item)] || item.title} →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-start">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  {t('videoTutorials.title') || 'Video Tutorials'}
                </CardTitle>
                <Badge>{locale === 'ar' ? 'جديد' : 'New'}</Badge>
              </div>
              <CardDescription>
                {t('videoTutorials.description') || 'Learn visually with our step-by-step video guides'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {videoTutorials.map((video) => (
                  <div key={video.title} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                        <Video className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{video.title}</p>
                        <p className="text-xs text-muted-foreground">{video.duration}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{video.views} views</p>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                {t('videoTutorials.viewAll') || 'View All Tutorials'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                {t('support.title') || 'Need Help?'}
              </CardTitle>
              <CardDescription>
                {t('support.description') || 'Our support team and community are here to help'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t('support.liveChat.title') || 'Live Chat Support'}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('support.liveChat.description') || 'Available 24/7 for premium users'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t('support.forum.title') || 'Community Forum'}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('support.forum.description') || 'Connect with 10,000+ traders'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t('support.email.title') || 'Email Support'}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('support.email.address') || 'support@quoantb.com'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Button className="w-full" variant="default">
                  {t('support.contactButton') || 'Contact Support'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}