'use client'

import { useState, Suspense } from 'react'
import { Grid3x3, List, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SmartComponent, QuickAction } from '@/lib/types/finchat'
import { SmartComponentRenderer } from './smart-component-renderer'
import { SmartCardSkeleton } from './smart-card-skeleton'
import { SmartComponentErrorBoundary } from './smart-component-error-boundary'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'

interface SmartComponentGridProps {
  components: SmartComponent[]
  onAction?: (action: QuickAction) => void
  className?: string
  defaultView?: 'grid' | 'list'
  maxColumns?: 1 | 2 | 3 | 4
}

export function SmartComponentGrid({
  components,
  onAction,
  className,
  defaultView = 'grid',
  maxColumns = 3
}: SmartComponentGridProps) {
  const [view, setView] = useState<'grid' | 'list'>(defaultView)
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null)
  const t = useTranslations('finChat.componentGrid')

  if (components.length === 0) return null

  const getGridCols = () => {
    if (view === 'list') return 'grid-cols-1'
    
    switch (maxColumns) {
      case 1:
        return 'grid-cols-1'
      case 2:
        return 'grid-cols-1 md:grid-cols-2'
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }
  }

  const handleExpand = (componentId: string) => {
    setExpandedComponent(expandedComponent === componentId ? null : componentId)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t('smartComponents', { count: components.length })}
        </h3>
        <div className="flex gap-1">
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setView('grid')}
            title={t('gridView')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setView('list')}
            title={t('listView')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Components Grid/List */}
      <div className={cn(
        'grid gap-4 transition-all duration-300',
        getGridCols()
      )}>
        {components.map((component) => (
          <div
            key={component.id}
            className={cn(
              'relative transition-all duration-300',
              expandedComponent === component.id && 'md:col-span-2 lg:col-span-3'
            )}
          >
            <SmartComponentErrorBoundary componentType={component.type}>
              <Suspense fallback={<SmartCardSkeleton />}>
                <div className="relative group">
                  <SmartComponentRenderer 
                    component={component} 
                    onAction={onAction}
                    className={cn(
                      view === 'list' && 'max-w-none',
                      expandedComponent === component.id && 'scale-105'
                    )}
                  />
                  
                  {/* Expand/Collapse Button */}
                  {view === 'grid' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'absolute top-2 right-2 h-7 w-7',
                        'opacity-0 group-hover:opacity-100 transition-opacity',
                        'bg-background/80 backdrop-blur-sm shadow-sm'
                      )}
                      onClick={() => handleExpand(component.id)}
                    >
                      {expandedComponent === component.id ? (
                        <Minimize2 className="h-3.5 w-3.5" />
                      ) : (
                        <Maximize2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                </div>
              </Suspense>
            </SmartComponentErrorBoundary>
          </div>
        ))}
      </div>
    </div>
  )
}