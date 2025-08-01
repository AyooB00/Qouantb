import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  className?: string
  count?: number
  height?: string | number
  width?: string | number
  circle?: boolean
}

export function LoadingSkeleton({
  className,
  count = 1,
  height = 20,
  width = '100%',
  circle = false
}: LoadingSkeletonProps) {
  const elements = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={cn(
        'animate-pulse bg-muted',
        circle ? 'rounded-full' : 'rounded-md',
        className
      )}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width
      }}
    />
  ))

  return <>{elements}</>
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="space-y-3">
        <LoadingSkeleton height={20} width="60%" />
        <LoadingSkeleton height={16} width="40%" />
        <div className="pt-4">
          <LoadingSkeleton height={12} count={3} className="mb-2" />
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 pb-2 border-b">
        <LoadingSkeleton height={16} width="20%" />
        <LoadingSkeleton height={16} width="30%" />
        <LoadingSkeleton height={16} width="25%" />
        <LoadingSkeleton height={16} width="25%" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <LoadingSkeleton height={14} width="20%" />
          <LoadingSkeleton height={14} width="30%" />
          <LoadingSkeleton height={14} width="25%" />
          <LoadingSkeleton height={14} width="25%" />
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="space-y-3">
        <LoadingSkeleton height={20} width="40%" />
        <div className="pt-4 space-y-2">
          <div className="flex items-end gap-2 h-48">
            {Array.from({ length: 12 }, (_, i) => (
              <LoadingSkeleton
                key={i}
                width="8.33%"
                height={Math.random() * 100 + 50}
                className="flex-1"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}