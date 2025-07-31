import { LandingHeader } from '@/components/landing/LandingHeader'
import { HeroSection } from '@/components/landing/HeroSection'
import { AIAgentsShowcase } from '@/components/landing/AIAgentsShowcase'
import { ArchitectureDiagram } from '@/components/landing/ArchitectureDiagram'
import { InvestmentFundsSection } from '@/components/landing/InvestmentFundsSection'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { FeatureShowcase } from '@/components/landing/FeatureShowcase'
import { DocumentationSection } from '@/components/landing/DocumentationSection'
import { TechStack } from '@/components/landing/TechStack'
import { Globe, Mail, Shield, FileText, Github, Linkedin } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
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
        
        {/* Technology Stack */}
        <section id="technology">
          <TechStack />
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
                <h3 className="font-semibold text-lg mb-4">QuoantB</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  AI-powered investment platform using advanced agents to identify trading 
                  and investment opportunities.
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
                <h3 className="font-semibold mb-4">Products</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/stock-analysis" className="text-muted-foreground hover:text-primary transition-colors">AI Stock Analysis</Link></li>
                  <li><Link href="/portfolio" className="text-muted-foreground hover:text-primary transition-colors">Portfolio Management</Link></li>
                  <li><Link href="/swing-trading" className="text-muted-foreground hover:text-primary transition-colors">Swing Trading</Link></li>
                  <li><Link href="/finchat" className="text-muted-foreground hover:text-primary transition-colors">FinChat Assistant</Link></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/docs" className="text-muted-foreground hover:text-primary transition-colors">Documentation</Link></li>
                  <li><Link href="/docs/api" className="text-muted-foreground hover:text-primary transition-colors">API Reference</Link></li>
                  <li><Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
                  <li><Link href="/community" className="text-muted-foreground hover:text-primary transition-colors">Community</Link></li>
                </ul>
              </div>

              {/* Legal & Security */}
              <div>
                <h3 className="font-semibold mb-4">Legal & Security</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                  <li><Link href="/security" className="text-muted-foreground hover:text-primary transition-colors">Security</Link></li>
                  <li><Link href="/compliance" className="text-muted-foreground hover:text-primary transition-colors">Compliance</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-12 pt-8 border-t">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  © 2024 QuoantB. All rights reserved. Not financial advice.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>SOC 2 Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>support@quoantb.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
    </>
  )
}