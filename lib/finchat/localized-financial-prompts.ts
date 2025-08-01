export interface PromptCategory {
  category: string
  icon: string
  prompts: string[]
}

export type LocalizedPrompts = {
  categories: PromptCategory[]
  featured: string[]
  followUp: {
    portfolio: string[]
    stock: string[]
    option: string[]
    market: string[]
    buySell: string[]
    default: string[]
  }
}

export const financialPrompts: Record<string, LocalizedPrompts> = {
  en: {
    categories: [
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
    ],
    featured: [
      "What is Apple (AAPL) stock price and analysis?",
      "Compare Microsoft (MSFT) vs Google (GOOGL) stocks",
      "Show me the current market overview and sentiment",
      "Get technical analysis for Tesla (TSLA) with indicators"
    ],
    followUp: {
      portfolio: [
        "How can I reduce risk in my portfolio?",
        "What's the ideal portfolio allocation for my age?",
        "Should I rebalance my portfolio now?",
        "How do I measure portfolio performance?"
      ],
      stock: [
        "What are the key metrics to evaluate?",
        "Show me the technical analysis",
        "What do analysts say about this stock?",
        "Compare with its competitors"
      ],
      option: [
        "What's the best strike price to choose?",
        "Explain the risk/reward ratio",
        "When should I close this position?",
        "What are alternative strategies?"
      ],
      market: [
        "Which sectors are performing best today?",
        "Show me the market sentiment analysis"
      ],
      buySell: [
        "What are the key risks to consider?",
        "Show me alternative investment options"
      ],
      default: [
        "Show market overview",
        "Analyze my portfolio performance",
        "Find trending stocks today"
      ]
    }
  },
  ar: {
    categories: [
      {
        category: 'تحليل السوق',
        icon: '📊',
        prompts: [
          "ما هي التوقعات الحالية لأسهم التكنولوجيا؟",
          "حلل تقلبات السوق اليوم والعوامل الرئيسية",
          "ما هي القطاعات الأفضل أداءً هذا الربع؟",
          "اشرح تأثير قرارات الاحتياطي الفيدرالي الأخيرة على الأسواق",
          "ما هي مخاطر السوق الرئيسية التي يجب مراقبتها هذا الأسبوع؟"
        ]
      },
      {
        category: 'بحث الأسهم',
        icon: '📈',
        prompts: [
          "حلل أداء سهم AAPL الأخير والتوقعات المستقبلية",
          "قارن بين MSFT و GOOGL كخيارات استثمارية",
          "ابحث عن أسهم مُقيّمة بأقل من قيمتها في قطاع الرعاية الصحية",
          "ما هي أفضل أسهم توزيعات الأرباح تحت 100 دولار؟",
          "أظهر لي أسهم التكنولوجيا عالية النمو مع أساسيات قوية"
        ]
      },
      {
        category: 'استراتيجية الاستثمار',
        icon: '💡',
        prompts: [
          "كيف يمكنني تنويع محفظة بقيمة 10,000 دولار؟",
          "اشرح استراتيجية متوسط التكلفة بالدولار",
          "ما هو أفضل نهج للاستثمار طويل المدى؟",
          "كيف أحمي محفظتي من التضخم؟",
          "قارن بين استراتيجيات الاستثمار في النمو مقابل القيمة"
        ]
      },
      {
        category: 'التحليل الفني',
        icon: '📉',
        prompts: [
          "اشرح مؤشر القوة النسبية (RSI) وكيفية استخدامه للتداول",
          "ماذا تخبرنا إشارات MACD عن السهم؟",
          "كيفية تحديد مستويات الدعم والمقاومة",
          "اشرح المتوسطات المتحركة وأهميتها",
          "ما هي أنماط الرسوم البيانية الرئيسية التي يجب مراقبتها؟"
        ]
      },
      {
        category: 'الخيارات والمشتقات',
        icon: '🎯',
        prompts: [
          "اشرح استراتيجيات الخيارات الأساسية للمبتدئين",
          "ما هي استراتيجية البيع المغطى؟",
          "كيف تعمل خيارات الحماية؟",
          "اشرح معاملات اليونانية في تداول الخيارات",
          "ما هي مخاطر تداول الخيارات؟"
        ]
      },
      {
        category: 'المؤشرات الاقتصادية',
        icon: '🌍',
        prompts: [
          "كيف يؤثر التضخم على أسعار الأسهم؟",
          "اشرح منحنى العائد وتداعياته",
          "ما هي المؤشرات الاقتصادية التي يجب أن أراقبها؟",
          "كيف تؤثر أسعار الفائدة على القطاعات المختلفة؟",
          "ما هي العلاقة بين الناتج المحلي الإجمالي والأسواق؟"
        ]
      }
    ],
    featured: [
      "ما هو سعر سهم آبل (AAPL) والتحليل؟",
      "قارن أسهم مايكروسوفت (MSFT) مقابل جوجل (GOOGL)",
      "أظهر لي نظرة عامة على السوق الحالية والمعنويات",
      "احصل على التحليل الفني لتسلا (TSLA) مع المؤشرات"
    ],
    followUp: {
      portfolio: [
        "كيف يمكنني تقليل المخاطر في محفظتي؟",
        "ما هو التوزيع المثالي للمحفظة لعمري؟",
        "هل يجب أن أعيد توازن محفظتي الآن؟",
        "كيف أقيس أداء المحفظة؟"
      ],
      stock: [
        "ما هي المقاييس الرئيسية للتقييم؟",
        "أظهر لي التحليل الفني",
        "ماذا يقول المحللون عن هذا السهم؟",
        "قارن مع منافسيه"
      ],
      option: [
        "ما هو أفضل سعر تنفيذ للاختيار؟",
        "اشرح نسبة المخاطرة/المكافأة",
        "متى يجب أن أغلق هذا المركز؟",
        "ما هي الاستراتيجيات البديلة؟"
      ],
      market: [
        "ما هي القطاعات الأفضل أداءً اليوم؟",
        "أظهر لي تحليل معنويات السوق"
      ],
      buySell: [
        "ما هي المخاطر الرئيسية التي يجب مراعاتها؟",
        "أظهر لي خيارات الاستثمار البديلة"
      ],
      default: [
        "أظهر نظرة عامة على السوق",
        "حلل أداء محفظتي",
        "ابحث عن الأسهم الرائجة اليوم"
      ]
    }
  }
}

// Helper function to get prompts by locale
export function getFinancialPrompts(locale: string = 'en'): LocalizedPrompts {
  return financialPrompts[locale] || financialPrompts.en
}

// Get all prompts flattened
export function getAllPrompts(locale: string = 'en'): string[] {
  const prompts = getFinancialPrompts(locale)
  return prompts.categories.flatMap(cat => cat.prompts)
}

// Get featured prompts
export function getFeaturedPrompts(locale: string = 'en'): string[] {
  return getFinancialPrompts(locale).featured
}

// Get context-aware suggestions
export function getSuggestedPrompts(context: string, locale: string = 'en'): string[] {
  const prompts = getFinancialPrompts(locale)
  const lowercaseContext = context.toLowerCase()
  
  if (lowercaseContext.includes('portfolio') || lowercaseContext.includes('محفظ')) {
    return prompts.followUp.portfolio
  }
  
  if (lowercaseContext.includes('stock') || lowercaseContext.includes('سهم') || lowercaseContext.includes('company') || lowercaseContext.includes('شرك')) {
    return prompts.followUp.stock
  }
  
  if (lowercaseContext.includes('option') || lowercaseContext.includes('خيار') || lowercaseContext.includes('derivative') || lowercaseContext.includes('مشتق')) {
    return prompts.followUp.option
  }

  if (lowercaseContext.includes('market') || lowercaseContext.includes('سوق')) {
    return prompts.followUp.market
  }

  if (lowercaseContext.includes('buy') || lowercaseContext.includes('sell') || lowercaseContext.includes('شراء') || lowercaseContext.includes('بيع')) {
    return prompts.followUp.buySell
  }
  
  // Default suggestions
  return prompts.followUp.default
}