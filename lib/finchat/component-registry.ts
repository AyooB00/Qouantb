import { ComponentType, lazy } from 'react'
import { SmartComponentType, ComponentRenderProps } from '@/lib/types/finchat'

export type SmartComponentModule = ComponentType<ComponentRenderProps>

interface ComponentRegistration {
  type: SmartComponentType
  loader: () => Promise<{ default: SmartComponentModule }>
  preload?: boolean
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
        loader: () => import('@/components/finchat/smart-cards/market-analysis-card'),
        preload: true
      },
      {
        type: 'stock-comparison',
        loader: () => import('@/components/finchat/smart-cards/stock-comparison-card'),
        preload: true
      },
      {
        type: 'technical-analysis',
        loader: () => import('@/components/finchat/smart-cards/technical-analysis-card'),
        preload: false
      },
      {
        type: 'news-summary',
        loader: () => import('@/components/finchat/smart-cards/news-summary-card'),
        preload: false
      },
      {
        type: 'portfolio-impact',
        loader: () => import('@/components/finchat/smart-cards/portfolio-impact-card'),
        preload: false
      },
      {
        type: 'risk-assessment',
        loader: () => import('@/components/finchat/smart-cards/risk-assessment-card'),
        preload: false
      },
      {
        type: 'price-alert',
        loader: () => import('@/components/finchat/smart-cards/price-alert-card'),
        preload: false
      },
      {
        type: 'earnings-summary',
        loader: () => import('@/components/finchat/smart-cards/earnings-summary-card'),
        preload: false
      },
      {
        type: 'sector-analysis',
        loader: () => import('@/components/finchat/smart-cards/sector-analysis-card'),
        preload: false
      },
      {
        type: 'sentiment-gauge',
        loader: () => import('@/components/finchat/smart-cards/sentiment-gauge-card'),
        preload: false
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
          default: () => null
        }
      }
      return { default: component }
    })
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
}