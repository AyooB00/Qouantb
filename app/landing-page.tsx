import { LandingHeader } from '@/components/landing/LandingHeader'
import { HeroSection } from '@/components/landing/HeroSection'
import { AIAgentsShowcase } from '@/components/landing/AIAgentsShowcase'
import { ArchitectureDiagram } from '@/components/landing/ArchitectureDiagram'
import { InvestmentFundsSection } from '@/components/landing/InvestmentFundsSection'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { FeatureShowcase } from '@/components/landing/FeatureShowcase'
import { DocumentationSection } from '@/components/landing/DocumentationSection'
import { Mail, Shield, Github, Linkedin } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function LandingPage() {
  const t = await getTranslations('landing.footer')
  
  return (
    <>
      <LandingHeader />
      <main className="pt-16"> {/* Account for fixed header */}
        {/* Hero Section */}
        <section>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <HeroSection />
          </div>
        </section>

        {/* AI Agents Showcase - Key Differentiator */}
        <section id="ai-agents">
          <AIAgentsShowcase />
        </section>

        {/* How It Works - Explain the Process */}
        <section id="how-it-works">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <HowItWorks />
          </div>
        </section>
        
        {/* Features Showcase - Detailed Features */}
        <section id="features">
          <FeatureShowcase />
        </section>

        {/* Investment Funds Section - Enterprise Focus */}
        <section id="enterprise">
          <InvestmentFundsSection />
        </section>

        {/* Architecture Diagram - Technical Details */}
        <section id="architecture">
          <ArchitectureDiagram />
        </section>

        {/* Documentation Section - Resources */}
        <section id="documentation">
          <DocumentationSection />
        </section>
      </main>
      
      {/* Enhanced Footer */}
      <footer className="bg-muted/50 border-t">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Company Info */}
              <div>
                <h3 className="font-semibold text-lg mb-4">{t('company.name')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('company.description')}
                </p>
                <div className="flex gap-4">
                  <Link href="https://github.com" className="text-muted-foreground hover:text-primary transition-colors">
                    <Github className="h-5 w-5" />
                  </Link>
                  <Link href="https://linkedin.com" className="text-muted-foreground hover:text-primary transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="font-semibold mb-4">{t('products.title')}</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/stock-analysis" className="text-muted-foreground hover:text-primary transition-colors">{t('products.stockAnalysis')}</Link></li>
                  <li><Link href="/portfolio" className="text-muted-foreground hover:text-primary transition-colors">{t('products.portfolio')}</Link></li>
                  <li><Link href="/swing-trading" className="text-muted-foreground hover:text-primary transition-colors">{t('products.swingTrading')}</Link></li>
                  <li><Link href="/finchat" className="text-muted-foreground hover:text-primary transition-colors">{t('products.finChat')}</Link></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="font-semibold mb-4">{t('resources.title')}</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/docs" className="text-muted-foreground hover:text-primary transition-colors">{t('resources.documentation')}</Link></li>
                  <li><Link href="/docs/api" className="text-muted-foreground hover:text-primary transition-colors">{t('resources.api')}</Link></li>
                  <li><Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">{t('resources.blog')}</Link></li>
                  <li><Link href="/community" className="text-muted-foreground hover:text-primary transition-colors">{t('resources.community')}</Link></li>
                </ul>
              </div>

              {/* Legal & Security */}
              <div>
                <h3 className="font-semibold mb-4">{t('legal.title')}</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">{t('legal.privacy')}</Link></li>
                  <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">{t('legal.terms')}</Link></li>
                  <li><Link href="/security" className="text-muted-foreground hover:text-primary transition-colors">{t('legal.security')}</Link></li>
                  <li><Link href="/compliance" className="text-muted-foreground hover:text-primary transition-colors">{t('legal.compliance')}</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-12 pt-8 border-t">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {t('copyright')}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>{t('socCompliant')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{t('email')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
    </>
  )
}