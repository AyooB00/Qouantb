export interface PromptCategory {
  category: string
  icon: string
  prompts: string[]
}

export const financialPromptCategories: PromptCategory[] = [
  {
    category: 'Market Analysis',
    icon: '📊',
    prompts: [
      "What's the current market outlook for tech stocks?",
      "Analyze today's market volatility and key drivers",
      "Which sectors are performing best this quarter?",
      "Explain the impact of recent Fed decisions on markets",
      "What are the key market risks to watch this week?"
    ]
  },
  {
    category: 'Stock Research',
    icon: '📈',
    prompts: [
      "Analyze AAPL's recent performance and outlook",
      "Compare MSFT vs GOOGL as investment options",
      "Find undervalued stocks in the healthcare sector",
      "What are the best dividend stocks under $100?",
      "Show me high-growth tech stocks with strong fundamentals"
    ]
  },
  {
    category: 'Investment Strategy',
    icon: '💡',
    prompts: [
      "How should I diversify a $10,000 portfolio?",
      "Explain dollar-cost averaging strategy",
      "What's the best approach for long-term investing?",
      "How do I hedge my portfolio against inflation?",
      "Compare growth vs value investing strategies"
    ]
  },
  {
    category: 'Technical Analysis',
    icon: '📉',
    prompts: [
      "Explain RSI and how to use it for trading",
      "What do MACD signals tell us about a stock?",
      "How to identify support and resistance levels",
      "Explain moving averages and their significance",
      "What are the key chart patterns to watch?"
    ]
  },
  {
    category: 'Options & Derivatives',
    icon: '🎯',
    prompts: [
      "Explain basic options strategies for beginners",
      "What is a covered call strategy?",
      "How do protective puts work?",
      "Explain the Greeks in options trading",
      "What are the risks of trading options?"
    ]
  },
  {
    category: 'Economic Indicators',
    icon: '🌍',
    prompts: [
      "How does inflation affect stock prices?",
      "Explain the yield curve and its implications",
      "What economic indicators should I monitor?",
      "How do interest rates impact different sectors?",
      "What's the relationship between GDP and markets?"
    ]
  }
]

// Flat list of all prompts for quick access
export const allFinancialPrompts = financialPromptCategories.flatMap(cat => cat.prompts)

// Featured prompts for the main interface
export const featuredPrompts = [
  "What's the market outlook for tech stocks?",
  "Analyze AAPL's recent performance",
  "Find undervalued dividend stocks",
  "How should I diversify my portfolio?"
]

// Context-aware prompt suggestions based on user's current conversation
export function getSuggestedPrompts(context: string): string[] {
  const lowercaseContext = context.toLowerCase()
  
  if (lowercaseContext.includes('portfolio') || lowercaseContext.includes('diversif')) {
    return [
      "How can I reduce risk in my portfolio?",
      "What's the ideal portfolio allocation for my age?",
      "Should I rebalance my portfolio now?",
      "How do I measure portfolio performance?"
    ]
  }
  
  if (lowercaseContext.includes('stock') || lowercaseContext.includes('company')) {
    return [
      "What are the key metrics to evaluate?",
      "Show me the technical analysis",
      "What do analysts say about this stock?",
      "Compare with its competitors"
    ]
  }
  
  if (lowercaseContext.includes('option') || lowercaseContext.includes('derivative')) {
    return [
      "What's the best strike price to choose?",
      "Explain the risk/reward ratio",
      "When should I close this position?",
      "What are alternative strategies?"
    ]
  }
  
  // Default suggestions
  return featuredPrompts
}