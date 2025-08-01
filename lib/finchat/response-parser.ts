import { 
  SmartComponent, 
  SmartComponentType, 
  MessageContext,
  MarketAnalysisData,
  StockComparisonData,
  TechnicalAnalysisData,
  NewsSummaryData
} from '@/lib/types/finchat'

type ToolResult = 
  | MarketAnalysisData
  | { stocks: Array<unknown> }
  | { indicators: { rsi?: unknown; macd?: unknown } }
  | { articles: Array<unknown> }
  | Record<string, unknown>

export class ResponseParser {
  private static instance: ResponseParser
  
  private constructor() {}
  
  static getInstance(): ResponseParser {
    if (!ResponseParser.instance) {
      ResponseParser.instance = new ResponseParser()
    }
    return ResponseParser.instance
  }

  parseResponse(content: string, toolResults?: ToolResult[]): {
    text: string
    components: SmartComponent[]
    context: MessageContext
    layout?: 'inline' | 'grid'
  } {
    const components: SmartComponent[] = []
    let cleanText = content
    
    // Extract context from content
    const context = this.extractContext(content)
    
    // Parse tool results if available
    if (toolResults && toolResults.length > 0) {
      toolResults.forEach((result, index) => {
        const component = this.parseToolResult(result)
        if (component) {
          components.push({
            ...component,
            id: `tool-${index}-${Date.now()}`
          })
        }
      })
    }
    
    // Extract inline component hints from content
    const inlineComponents = this.extractInlineComponents(content)
    components.push(...inlineComponents)
    
    // Remove component markers from text
    cleanText = this.removeComponentMarkers(content)
    
    // Auto-detect components based on content patterns
    const detectedComponents = this.detectComponents(content, context)
    components.push(...detectedComponents)
    
    // Sort by priority
    components.sort((a, b) => b.priority - a.priority)
    
    // Determine layout based on components
    const layout = this.determineLayout(components, content)
    
    return {
      text: cleanText,
      components,
      context,
      layout
    }
  }
  
  private determineLayout(components: SmartComponent[], content: string): 'inline' | 'grid' {
    // Check for explicit layout hints in content
    if (content.toLowerCase().includes('[grid]') || content.toLowerCase().includes('grid view')) {
      return 'grid'
    }
    
    // Use grid layout if we have multiple components of different types
    if (components.length > 1) {
      const uniqueTypes = new Set(components.map(c => c.type))
      if (uniqueTypes.size > 1) {
        return 'grid'
      }
    }
    
    // Use grid for certain component combinations
    const hasAnalysis = components.some(c => c.type === 'technical-analysis' || c.type === 'market-analysis')
    const hasComparison = components.some(c => c.type === 'stock-comparison')
    if (hasAnalysis && hasComparison) {
      return 'grid'
    }
    
    return 'inline'
  }

  private extractContext(content: string): MessageContext {
    const symbols = this.extractStockSymbols(content)
    const intent = this.detectIntent(content)
    const topics = this.extractTopics(content)
    
    return {
      intent,
      symbols,
      topics,
      timeframe: this.extractTimeframe(content),
      riskLevel: this.extractRiskLevel(content)
    }
  }

  private detectIntent(content: string): MessageContext['intent'] {
    const lowerContent = content.toLowerCase()
    
    if (lowerContent.includes('buy') || lowerContent.includes('sell') || lowerContent.includes('trade')) {
      return 'trading'
    }
    if (lowerContent.includes('learn') || lowerContent.includes('what is') || lowerContent.includes('how does')) {
      return 'learning'
    }
    if (lowerContent.includes('monitor') || lowerContent.includes('watch') || lowerContent.includes('alert')) {
      return 'monitoring'
    }
    if (lowerContent.includes('analyze') || lowerContent.includes('technical') || lowerContent.includes('fundamental')) {
      return 'analysis'
    }
    
    return 'research'
  }

  private extractStockSymbols(text: string): string[] {
    const patterns = [
      /\$([A-Z]{1,5})\b/g,
      /\b([A-Z]{2,5})(?=\s*(?:stock|shares?|price|is|at|trading))/gi,
      /\(([A-Z]{1,5})\)/g,
    ]
    
    const symbols = new Set<string>()
    patterns.forEach(pattern => {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        if (match[1]) {
          symbols.add(match[1].toUpperCase())
        }
      }
    })
    
    return Array.from(symbols)
  }

  private extractTopics(content: string): string[] {
    const topics: string[] = []
    const lowerContent = content.toLowerCase()
    
    const topicKeywords = {
      'earnings': ['earnings', 'revenue', 'profit', 'eps'],
      'technical': ['rsi', 'macd', 'moving average', 'support', 'resistance'],
      'news': ['news', 'announcement', 'report', 'headline'],
      'valuation': ['pe ratio', 'price to earnings', 'valuation', 'overvalued', 'undervalued'],
      'dividend': ['dividend', 'yield', 'payout'],
      'options': ['options', 'calls', 'puts', 'strike price'],
      'crypto': ['bitcoin', 'ethereum', 'crypto', 'blockchain']
    }
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        topics.push(topic)
      }
    }
    
    return topics
  }

  private extractTimeframe(content: string): string | undefined {
    const timeframePatterns = [
      /(?:next|past|last)\s+(\d+\s+(?:day|week|month|year))s?/i,
      /(?:daily|weekly|monthly|yearly)/i,
      /(?:short[- ]term|long[- ]term|mid[- ]term)/i
    ]
    
    for (const pattern of timeframePatterns) {
      const match = content.match(pattern)
      if (match) {
        return match[0]
      }
    }
    
    return undefined
  }

  private extractRiskLevel(content: string): 'low' | 'medium' | 'high' | undefined {
    const lowerContent = content.toLowerCase()
    
    if (lowerContent.includes('low risk') || lowerContent.includes('conservative')) {
      return 'low'
    }
    if (lowerContent.includes('high risk') || lowerContent.includes('aggressive')) {
      return 'high'
    }
    if (lowerContent.includes('moderate risk') || lowerContent.includes('balanced')) {
      return 'medium'
    }
    
    return undefined
  }

  private parseToolResult(result: ToolResult): Omit<SmartComponent, 'id'> | null {
    // Parse based on tool type/structure
    // Market overview data
    if ('indices' in result && 'sentiment' in result) {
      return {
        type: 'market-analysis',
        data: result as MarketAnalysisData,
        priority: 10,
        interactive: true
      }
    }
    
    // Stock comparison data
    if ('stocks' in result && Array.isArray(result.stocks)) {
      return {
        type: 'stock-comparison',
        data: { stocks: result.stocks } as StockComparisonData,
        priority: 9,
        interactive: true
      }
    }
    
    // Technical indicators data
    if ('indicators' in result && result.indicators && ('rsi' in result.indicators || 'macd' in result.indicators)) {
      return {
        type: 'technical-analysis',
        data: result as TechnicalAnalysisData,
        priority: 8,
        interactive: true
      }
    }
    
    // News data
    if ('articles' in result && Array.isArray(result.articles)) {
      return {
        type: 'news-summary',
        data: result as NewsSummaryData,
        priority: 7,
        interactive: false
      }
    }
    
    // Stock quote data - convert to a stock card component
    if ('symbol' in result && 'currentPrice' in result && result.currentPrice !== undefined) {
      return {
        type: 'stock-quote',
        data: result,
        priority: 9,
        interactive: true
      }
    }
    
    // Position sizing data
    if (result.recommendedShares !== undefined && result.totalCost !== undefined) {
      return {
        type: 'position-calculator',
        data: result,
        priority: 8,
        interactive: true
      }
    }
    
    // Portfolio summary
    if (result.mockExample && result.mockExample.totalValue) {
      return {
        type: 'portfolio-summary',
        data: result.mockExample,
        priority: 8,
        interactive: true
      }
    }
    
    return null
  }

  private extractInlineComponents(content: string): SmartComponent[] {
    const components: SmartComponent[] = []
    
    // Look for component markers like [COMPONENT:type:data]
    const componentPattern = /\[COMPONENT:(\w+):([^\]]+)\]/g
    const matches = content.matchAll(componentPattern)
    
    for (const match of matches) {
      const [, type, dataStr] = match
      try {
        const data = JSON.parse(dataStr)
        components.push({
          id: `inline-${type}-${Date.now()}`,
          type: type as SmartComponentType,
          data,
          priority: 5,
          interactive: true
        })
      } catch (e) {
        console.error('Failed to parse inline component:', e)
      }
    }
    
    return components
  }

  private removeComponentMarkers(content: string): string {
    return content.replace(/\[COMPONENT:\w+:[^\]]+\]/g, '').trim()
  }

  private detectComponents(content: string, context: MessageContext): SmartComponent[] {
    const components: SmartComponent[] = []
    const lowerContent = content.toLowerCase()
    
    // Detect market analysis need
    if (lowerContent.includes('market') && 
        (lowerContent.includes('overview') || lowerContent.includes('sentiment') || lowerContent.includes('summary'))) {
      components.push({
        id: `auto-market-${Date.now()}`,
        type: 'market-analysis',
        data: null, // Will be populated by the component
        priority: 6,
        interactive: true,
        metadata: { source: 'auto-detected' }
      })
    }
    
    // Detect comparison need
    if (context.symbols.length > 1 && 
        (lowerContent.includes('compare') || lowerContent.includes('vs') || lowerContent.includes('versus'))) {
      components.push({
        id: `auto-compare-${Date.now()}`,
        type: 'stock-comparison',
        data: { symbols: context.symbols },
        priority: 7,
        interactive: true,
        metadata: { source: 'auto-detected' }
      })
    }
    
    // Detect technical analysis need
    if (context.symbols.length > 0 && 
        (lowerContent.includes('technical') || lowerContent.includes('rsi') || lowerContent.includes('macd'))) {
      components.push({
        id: `auto-technical-${Date.now()}`,
        type: 'technical-analysis',
        data: { symbol: context.symbols[0] },
        priority: 6,
        interactive: true,
        metadata: { source: 'auto-detected' }
      })
    }
    
    return components
  }
}