import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface PortfolioItem {
  id: string
  symbol: string
  companyName: string
  quantity: number
  avgCost: number
  addedDate: string
  lastUpdated: string
  currentPrice?: number
  totalValue?: number
  profitLoss?: number
  profitLossPercent?: number
  // Enhanced fields
  sector?: string
  industry?: string
  marketCap?: number
  beta?: number
  peRatio?: number
  dividendYield?: number
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekLow?: number
  dayChange?: number
  dayChangePercent?: number
  volume?: number
  avgVolume?: number
  lastAnalysis?: {
    timestamp: string
    tips: string[]
    forecast: {
      sevenDay: number
      thirtyDay: number
      confidence: number
    }
    sentiment: 'bullish' | 'bearish' | 'neutral'
    technicalIndicators?: {
      rsi: number
      sma50: number
      sma200: number
      support: number
      resistance: number
    }
  }
}

interface PortfolioStore {
  items: PortfolioItem[]
  totalValue: number
  totalCost: number
  totalProfitLoss: number
  totalProfitLossPercent: number
  lastUpdated: string | null
  isLoading: boolean
  isInitialized: boolean
  
  // Actions
  addItem: (item: Omit<PortfolioItem, 'id' | 'addedDate' | 'lastUpdated'>) => void
  removeItem: (id: string) => void
  updateItem: (id: string, updates: Partial<PortfolioItem>) => void
  updateQuantity: (id: string, quantity: number) => void
  updatePrices: (prices: Record<string, number>) => void
  updateAnalysis: (id: string, analysis: PortfolioItem['lastAnalysis']) => void
  calculateTotals: () => void
  clearPortfolio: () => void
  setLoading: (loading: boolean) => void
  initializeWithDefaults: () => void
}

// Default example stocks
const defaultStocks: PortfolioItem[] = [
  {
    id: 'AAPL-default',
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    quantity: 50,
    avgCost: 175.50,
    addedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
    lastUpdated: new Date().toISOString(),
    currentPrice: 185.25,
    totalValue: 9262.50,
    profitLoss: 487.50,
    profitLossPercent: 5.55,
    sector: 'Technology',
    marketCap: 3000000000000, // $3T
    beta: 1.25,
    peRatio: 31.5,
    dayChangePercent: 1.2
  },
  {
    id: 'MSFT-default',
    symbol: 'MSFT',
    companyName: 'Microsoft Corporation',
    quantity: 25,
    avgCost: 380.00,
    addedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    lastUpdated: new Date().toISOString(),
    currentPrice: 415.50,
    totalValue: 10387.50,
    profitLoss: 887.50,
    profitLossPercent: 9.34,
    sector: 'Technology',
    marketCap: 3100000000000, // $3.1T
    beta: 0.93,
    peRatio: 35.8,
    dayChangePercent: -0.8
  },
  {
    id: 'TSLA-default',
    symbol: 'TSLA',
    companyName: 'Tesla, Inc.',
    quantity: 15,
    avgCost: 245.00,
    addedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    lastUpdated: new Date().toISOString(),
    currentPrice: 235.75,
    totalValue: 3536.25,
    profitLoss: -138.75,
    profitLossPercent: -3.78,
    sector: 'Consumer Discretionary',
    marketCap: 750000000000, // $750B
    beta: 2.02,
    peRatio: 78.5,
    dayChangePercent: -3.5
  }
]

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalValue: 0,
      totalCost: 0,
      totalProfitLoss: 0,
      totalProfitLossPercent: 0,
      lastUpdated: null,
      isLoading: false,
      isInitialized: false,

      addItem: (item) => {
        const newItem: PortfolioItem = {
          ...item,
          id: `${item.symbol}-${Date.now()}`,
          addedDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        }
        
        set((state) => ({
          items: [...state.items, newItem],
        }))
        
        get().calculateTotals()
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
        get().calculateTotals()
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updates, lastUpdated: new Date().toISOString() }
              : item
          ),
        }))
        get().calculateTotals()
      },

      updateQuantity: (id, quantity) => {
        get().updateItem(id, { quantity })
      },

      updatePrices: (prices) => {
        set((state) => ({
          items: state.items.map((item) => {
            const currentPrice = prices[item.symbol]
            if (!currentPrice) return item

            const totalValue = currentPrice * item.quantity
            const totalCost = item.avgCost * item.quantity
            const profitLoss = totalValue - totalCost
            const profitLossPercent = ((profitLoss / totalCost) * 100)

            return {
              ...item,
              currentPrice,
              totalValue,
              profitLoss,
              profitLossPercent,
              lastUpdated: new Date().toISOString(),
            }
          }),
          lastUpdated: new Date().toISOString(),
        }))
        get().calculateTotals()
      },

      updateAnalysis: (id, analysis) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, lastAnalysis: analysis, lastUpdated: new Date().toISOString() }
              : item
          ),
        }))
      },

      calculateTotals: () => {
        const items = get().items
        const totalValue = items.reduce((sum, item) => sum + (item.totalValue || 0), 0)
        const totalCost = items.reduce((sum, item) => sum + (item.avgCost * item.quantity), 0)
        const totalProfitLoss = totalValue - totalCost
        const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0

        set({
          totalValue,
          totalCost,
          totalProfitLoss,
          totalProfitLossPercent,
        })
      },

      clearPortfolio: () => {
        set({
          items: [],
          totalValue: 0,
          totalCost: 0,
          totalProfitLoss: 0,
          totalProfitLossPercent: 0,
          lastUpdated: null,
        })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      initializeWithDefaults: () => {
        const state = get()
        if (!state.isInitialized && state.items.length === 0) {
          set({
            items: defaultStocks,
            isInitialized: true
          })
          get().calculateTotals()
        }
      },
    }),
    {
      name: 'portfolio-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)