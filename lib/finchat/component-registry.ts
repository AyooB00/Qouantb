import { ComponentType, lazy } from 'react'
import { SmartComponentType, ComponentRenderProps } from '@/lib/types/finchat'

export type SmartComponentModule = ComponentType<ComponentRenderProps>

export interface ComponentMetadata {
  supportedLocales: string[]
  gridSize?: 'compact' | 'normal' | 'wide' | 'full'
  priority: number
  category: 'analysis' | 'market' | 'portfolio' | 'alert' | 'news'
  requiresAuth?: boolean
}

interface ComponentRegistration {
  type: SmartComponentType
  loader: () => Promise<{ default: SmartComponentModule }>
  preload?: boolean
  metadata: ComponentMetadata
}

export class ComponentRegistry {
  private static instance: ComponentRegistry
  private components: Map<SmartComponentType, ComponentRegistration> = new Map()
  private loadedComponents: Map<SmartComponentType, SmartComponentModule> = new Map()
  
  private constructor() {
    this.registerDefaultComponents()
  }
  
  static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry()
    }
    return ComponentRegistry.instance
  }
  
  private registerDefaultComponents() {
    // Register all smart components with lazy loading
    const componentMap: ComponentRegistration[] = [
      {
        type: 'market-analysis',
        loader: () => import('@/components/finchat/smart-cards/market-analysis-card') as any,
        preload: true,
        metadata: {
          supportedLocales: ['en', 'ar'],
          gridSize: 'wide',
          priority: 10,
          category: 'market'
        }
      },
      {
        type: 'stock-comparison',
        loader: () => import('@/components/finchat/smart-cards/stock-comparison-card') as any,
        preload: true,
        metadata: {
          supportedLocales: ['en', 'ar'],
          gridSize: 'wide',
          priority: 9,
          category: 'analysis'
        }
      },
      {
        type: 'technical-analysis',
        loader: () => import('@/components/finchat/smart-cards/technical-analysis-card') as any,
        preload: false,
        metadata: {
          supportedLocales: ['en', 'ar'],
          gridSize: 'normal',
          priority: 8,
          category: 'analysis'
        }
      },
      {
        type: 'news-summary',
        loader: () => import('@/components/finchat/smart-cards/news-summary-card') as any,
        preload: false,
        metadata: {
          supportedLocales: ['en', 'ar'],
          gridSize: 'normal',
          priority: 7,
          category: 'news'
        }
      },
      {
        type: 'portfolio-impact',
        loader: () => import('@/components/finchat/smart-cards/portfolio-impact-card') as any,
        preload: false,
        metadata: {
          supportedLocales: ['en', 'ar'],
          gridSize: 'normal',
          priority: 6,
          category: 'portfolio',
          requiresAuth: true
        }
      },
      {
        type: 'risk-assessment',
        loader: () => import('@/components/finchat/smart-cards/risk-assessment-card') as any,
        preload: false,
        metadata: {
          supportedLocales: ['en', 'ar'],
          gridSize: 'compact',
          priority: 5,
          category: 'analysis'
        }
      },
      {
        type: 'price-alert',
        loader: () => import('@/components/finchat/smart-cards/price-alert-card') as any,
        preload: false,
        metadata: {
          supportedLocales: ['en', 'ar'],
          gridSize: 'compact',
          priority: 4,
          category: 'alert'
        }
      },
      {
        type: 'earnings-summary',
        loader: () => import('@/components/finchat/smart-cards/earnings-summary-card') as any,
        preload: false,
        metadata: {
          supportedLocales: ['en', 'ar'],
          gridSize: 'normal',
          priority: 6,
          category: 'analysis'
        }
      },
      {
        type: 'sector-analysis',
        loader: () => import('@/components/finchat/smart-cards/sector-analysis-card') as any,
        preload: false,
        metadata: {
          supportedLocales: ['en', 'ar'],
          gridSize: 'normal',
          priority: 7,
          category: 'market'
        }
      },
      {
        type: 'sentiment-gauge',
        loader: () => import('@/components/finchat/smart-cards/sentiment-gauge-card') as any,
        preload: false,
        metadata: {
          supportedLocales: ['en', 'ar'],
          gridSize: 'compact',
          priority: 5,
          category: 'analysis'
        }
      },
      {
        type: 'stock-quote',
        loader: () => import('@/components/finchat/smart-cards/stock-quote-card') as any,
        preload: true,
        metadata: {
          supportedLocales: ['en', 'ar'],
          gridSize: 'normal',
          priority: 9,
          category: 'market'
        }
      },
      {
        type: 'position-calculator',
        loader: () => import('@/components/finchat/smart-cards/position-calculator-card') as any,
        preload: false,
        metadata: {
          supportedLocales: ['en', 'ar'],
          gridSize: 'normal',
          priority: 7,
          category: 'portfolio'
        }
      },
      {
        type: 'portfolio-summary',
        loader: () => import('@/components/finchat/smart-cards/portfolio-summary-card') as any,
        preload: false,
        metadata: {
          supportedLocales: ['en', 'ar'],
          gridSize: 'wide',
          priority: 8,
          category: 'portfolio'
        }
      }
    ]
    
    componentMap.forEach(registration => {
      this.components.set(registration.type, registration)
      
      // Preload high-priority components
      if (registration.preload) {
        this.preloadComponent(registration.type)
      }
    })
  }
  
  async getComponent(type: SmartComponentType): Promise<SmartComponentModule | null> {
    // Check if already loaded
    const loaded = this.loadedComponents.get(type)
    if (loaded) {
      return loaded
    }
    
    // Get registration
    const registration = this.components.get(type)
    if (!registration) {
      console.warn(`No component registered for type: ${type}`)
      return null
    }
    
    try {
      // Load the component
      const loadedModule = await registration.loader()
      const component = loadedModule.default
      
      // Cache it
      this.loadedComponents.set(type, component)
      
      return component
    } catch (error) {
      console.error(`Failed to load component ${type}:`, error)
      return null
    }
  }
  
  private async preloadComponent(type: SmartComponentType): Promise<void> {
    try {
      await this.getComponent(type)
    } catch (error) {
      console.error(`Failed to preload component ${type}:`, error)
    }
  }
  
  // Create a lazy wrapper for React components
  createLazyComponent(type: SmartComponentType): ComponentType<ComponentRenderProps> {
    return lazy(async () => {
      const component = await this.getComponent(type)
      if (!component) {
        // Return a fallback component
        return {
          default: (() => null) as SmartComponentModule
        }
      }
      return { default: component }
    }) as ComponentType<ComponentRenderProps>
  }
  
  // Preload multiple components
  async preloadComponents(types: SmartComponentType[]): Promise<void> {
    await Promise.all(types.map(type => this.preloadComponent(type)))
  }
  
  // Check if component is registered
  hasComponent(type: SmartComponentType): boolean {
    return this.components.has(type)
  }
  
  // Get all registered component types
  getRegisteredTypes(): SmartComponentType[] {
    return Array.from(this.components.keys())
  }
  
  // Get component metadata
  getComponentMetadata(type: SmartComponentType): ComponentMetadata | null {
    const registration = this.components.get(type)
    return registration?.metadata || null
  }
  
  // Get components by category
  getComponentsByCategory(category: ComponentMetadata['category']): SmartComponentType[] {
    return Array.from(this.components.entries())
      .filter(([_, reg]) => reg.metadata.category === category)
      .map(([type]) => type)
  }
  
  // Check if component supports locale
  supportsLocale(type: SmartComponentType, locale: string): boolean {
    const metadata = this.getComponentMetadata(type)
    return metadata?.supportedLocales.includes(locale) || false
  }
}