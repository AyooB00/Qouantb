'use client'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SmartCardSkeletonProps {
  className?: string
}

export function SmartCardSkeleton({ className }: SmartCardSkeletonProps) {
  return (
    <Card className={cn('animate-pulse', className)}>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-6 w-16 bg-muted rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-20 bg-muted rounded" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-muted rounded" />
          <div className="h-8 w-20 bg-muted rounded" />
        </div>
      </div>
    </Card>
  )
}