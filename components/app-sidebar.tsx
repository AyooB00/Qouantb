"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from 'next-intl'
import { useLocale } from '@/lib/locale-context'
import { 
  Home, 
  BrainCircuit, 
  MessageSquare, 
  TrendingUp, 
  ChartLine,
  Settings,
  Moon,
  Sun
} from "lucide-react"
import { useTheme } from "next-themes"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar"
import { LanguageSwitcher } from "@/components/language-switcher"

export function AppSidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const t = useTranslations('nav')
  const locale = useLocale()

  const mainNavItems = [
    {
      title: t('dashboard'),
      href: '/dashboard',
      icon: Home,
      description: "Overview and quick access"
    },
    {
      title: t('portfolio'),
      href: '/portfolio',
      icon: ChartLine,
      description: "Track your investments"
    },
    {
      title: t('finChat'),
      href: '/finchat',
      icon: MessageSquare,
      description: "AI financial assistant"
    }
  ]

  const opportunityItems = [
    {
      title: t('stockAnalysis'),
      href: '/stock-analysis',
      icon: BrainCircuit,
      description: "AI-powered analysis"
    },
    {
      title: t('swingTrading'),
      href: '/swing-trading',
      icon: TrendingUp,
      description: "Find trading opportunities"
    }
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="h-auto py-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md transition-all duration-200 group-hover:shadow-lg">
                  <TrendingUp className="size-4 transition-transform duration-200 group-hover:scale-110" />
                </div>
                <div className="flex flex-col gap-0 min-w-0">
                  <span className="font-bold text-base truncate">QuantumBoard</span>
                  <span className="text-[10px] text-muted-foreground truncate">{locale === 'ar' ? 'تداول ذكي بالذكاء الاصطناعي' : 'AI-Powered Trading'}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarGroup className="py-2">
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/" && pathname.startsWith(item.href))
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.title}
                      variant="button"
                      className="group"
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4 transition-all duration-200 group-hover:scale-110 group-hover:text-teal-600" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="pt-4 border-t border-border/50">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground mb-2">{t('opportunityAnalysis')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {opportunityItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/" && pathname.startsWith(item.href))
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.title}
                      variant="button"
                      className="group"
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4 transition-all duration-200 group-hover:scale-110 group-hover:text-teal-600" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={t('settings')} variant="button" className="group">
              <Link href="/settings">
                <Settings className="size-4 transition-all duration-200 group-hover:rotate-45 group-hover:text-teal-600" />
                <span className="font-medium">{t('settings')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              tooltip={t('toggleTheme')}
              variant="button"
              className="group"
            >
              <div className="relative">
                <Sun className="size-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 group-hover:text-yellow-500" />
                <Moon className="absolute inset-0 size-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 group-hover:text-blue-400" />
              </div>
              <span className="font-medium">{t('toggleTheme')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <LanguageSwitcher showLabel={!isCollapsed} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}