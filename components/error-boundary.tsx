'use client'

import { Component, ReactNode, ErrorInfo } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

function ErrorDisplay({ error, onRetry }: { error?: Error; onRetry: () => void }) {
  const t = useTranslations('common')
  
  return (
    <Alert variant="destructive" className="m-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{t('error')}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm">{error?.message || t('unexpectedError')}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={onRetry}
        >
          {t('retry')}
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <ErrorDisplay error={this.state.error} onRetry={() => {
        this.setState({ hasError: false, error: undefined })
        window.location.reload()
      }} />
    }

    return this.props.children
  }
}