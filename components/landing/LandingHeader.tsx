'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useLocale } from 'next-intl'
import { Moon, Sun, LogIn, Menu, X, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { LanguageSwitcher } from '@/components/language-switcher'

export function LandingHeader() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const locale = useLocale()

  const navItems = [
    { label: locale === 'ar' ? 'وكلاء الذكاء الاصطناعي' : 'AI Agents', href: '#ai-agents' },
    { label: locale === 'ar' ? 'المميزات' : 'Features', href: '#features' },
    { label: locale === 'ar' ? 'كيف يعمل' : 'How it Works', href: '#how-it-works' },
    { label: locale === 'ar' ? 'للمؤسسات' : 'For Enterprise', href: '#enterprise' },
    { label: locale === 'ar' ? 'الوثائق' : 'Docs', href: '#documentation' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 text-white shadow-lg">
              <span className="text-sm font-bold">Q</span>
            </div>
            <span className="font-bold text-xl">QuantumBoard</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher 
              variant="ghost" 
              size="icon"
              showLabel={false}
              className="hidden sm:inline-flex"
            />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="hidden sm:inline-flex"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            <Button variant="outline" asChild className="hidden sm:inline-flex">
              <Link href="#enterprise">
                <Building2 className="mr-2 h-4 w-4" />
                {locale === 'ar' ? 'للمؤسسات' : 'For Enterprise'}
              </Link>
            </Button>
            
            <Button asChild>
              <Link href={`/${locale}/dashboard`}>
                <LogIn className="mr-2 h-4 w-4" />
                {locale === 'ar' ? 'ابدأ الآن' : 'Get Started'}
              </Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="pt-4 border-t space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setTheme(theme === "light" ? "dark" : "light")
                        setIsOpen(false)
                      }}
                    >
                      {theme === "light" ? (
                        <>
                          <Moon className="mr-2 h-4 w-4" />
                          {locale === 'ar' ? 'الوضع الداكن' : 'Dark Mode'}
                        </>
                      ) : (
                        <>
                          <Sun className="mr-2 h-4 w-4" />
                          {locale === 'ar' ? 'الوضع الفاتح' : 'Light Mode'}
                        </>
                      )}
                    </Button>
                    <div className="px-3">
                      <LanguageSwitcher 
                        variant="ghost" 
                        className="w-full justify-start"
                      />
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}