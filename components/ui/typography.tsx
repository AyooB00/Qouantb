import { cn } from '@/lib/utils'
import { useLocale } from 'next-intl'
import { ReactNode, JSX } from 'react'

interface TypographyProps {
  children: ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function Heading1({ children, className, as: Component = 'h1' }: TypographyProps) {
  const locale = useLocale()
  return (
    <Component
      className={cn(
        'scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl',
        locale === 'ar' && 'font-semibold',
        className
      )}
    >
      {children}
    </Component>
  )
}

export function Heading2({ children, className, as: Component = 'h2' }: TypographyProps) {
  const locale = useLocale()
  return (
    <Component
      className={cn(
        'scroll-m-20 text-3xl font-semibold tracking-tight',
        locale === 'ar' && 'text-2xl',
        className
      )}
    >
      {children}
    </Component>
  )
}

export function Heading3({ children, className, as: Component = 'h3' }: TypographyProps) {
  const locale = useLocale()
  return (
    <Component
      className={cn(
        'scroll-m-20 text-2xl font-semibold tracking-tight',
        locale === 'ar' && 'text-xl',
        className
      )}
    >
      {children}
    </Component>
  )
}

export function Paragraph({ children, className }: Omit<TypographyProps, 'as'>) {
  const locale = useLocale()
  return (
    <p
      className={cn(
        'leading-7 [&:not(:first-child)]:mt-6',
        locale === 'ar' && 'leading-8 text-base',
        className
      )}
    >
      {children}
    </p>
  )
}

export function Lead({ children, className }: Omit<TypographyProps, 'as'>) {
  const locale = useLocale()
  return (
    <p
      className={cn(
        'text-xl text-muted-foreground',
        locale === 'ar' && 'text-lg leading-8',
        className
      )}
    >
      {children}
    </p>
  )
}

// Mixed content component for handling Arabic/English mixed text
export function MixedContent({ children, className }: Omit<TypographyProps, 'as'>) {
  return (
    <span className={cn('mixed-content', className)}>
      {children}
    </span>
  )
}

// Numeric display component to ensure numbers stay LTR
export function NumericDisplay({ children, className }: Omit<TypographyProps, 'as'>) {
  return (
    <span className={cn('tabular-nums', className)} data-numeric="true">
      {children}
    </span>
  )
}