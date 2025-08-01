'use client'

import { useEffect, useState } from 'react'
import { ComponentRegistry, SmartComponentModule } from '@/lib/finchat/component-registry'
import { SmartComponent, QuickAction } from '@/lib/types/finchat'
import { SmartCardSkeleton } from './smart-card-skeleton'
import { cn } from '@/lib/utils'

interface SmartComponentRendererProps {
  component: SmartComponent
  onAction?: (action: QuickAction) => void
  className?: string
}

export function SmartComponentRenderer({ 
  component, 
  onAction,
  className 
}: SmartComponentRendererProps) {
  const [Component, setComponent] = useState<SmartComponentModule | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadComponent = async () => {
      const registry = ComponentRegistry.getInstance()
      const comp = await registry.getComponent(component.type)
      if (comp) {
        setComponent(comp)
      }
      setLoading(false)
    }
    loadComponent()
  }, [component.type])
  
  if (loading) return <SmartCardSkeleton />
  if (!Component) return null
  
  return <Component data={component.data} onAction={onAction} className={className} />
}