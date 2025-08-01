'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LucideIcon, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocale } from '@/lib/locale-context'
import { QuickAction } from '@/lib/types/finchat'

interface BaseSmartCardProps {
  title: string
  icon?: LucideIcon
  iconColor?: string
  badge?: {
    label: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
    className?: string
  }
  children: ReactNode
  className?: string
  error?: boolean
  errorMessage?: string
  loading?: boolean
  onRetry?: () => void
  actions?: {
    label: string
    action: QuickAction
    variant?: 'default' | 'secondary' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'lg'
  }[]
  onAction?: (action: QuickAction) => void
  rtlSupport?: boolean
}

export function BaseSmartCard({
  title,
  icon: Icon,
  iconColor = 'text-teal-600',
  badge,
  children,
  className,
  error,
  errorMessage,
  loading,
  onRetry,
  actions,
  onAction,
  rtlSupport = true
}: BaseSmartCardProps) {
  const locale = useLocale()
  const isRTL = rtlSupport && locale === 'ar'

  if (error) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {errorMessage || 'Failed to load data'}
            </p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader className="pb-3">
          <div className="h-5 bg-muted rounded w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-20 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('overflow-hidden', className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-3">
        <div className={cn(
          'flex items-center justify-between',
          isRTL && 'flex-row-reverse'
        )}>
          <CardTitle className={cn(
            'flex items-center gap-2',
            isRTL && 'flex-row-reverse'
          )}>
            {Icon && <Icon className={cn('h-5 w-5', iconColor)} />}
            <span>{title}</span>
          </CardTitle>
          {badge && (
            <Badge 
              variant={badge.variant} 
              className={cn('capitalize', badge.className)}
            >
              {badge.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {children}
        
        {actions && actions.length > 0 && onAction && (
          <div className={cn(
            'flex flex-wrap gap-2 pt-2',
            isRTL && 'flex-row-reverse'
          )}>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size={action.size || 'sm'}
                onClick={() => onAction(action.action)}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}