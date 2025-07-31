import { NextRequest, NextResponse } from 'next/server'
import { FinnhubClient } from '@/lib/finnhub'

// Simple in-memory cache with TTL
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const symbol = searchParams.get('symbol')
    const days = parseInt(searchParams.get('days') || '30')

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      )
    }

    if (!process.env.FINNHUB_API_KEY) {
      // Return mock data if no API key
      const mockPrices = Array.from({ length: days }, (_, i) => {
        const basePrice = 150
        const variation = Math.sin(i / 5) * 10 + Math.random() * 5
        return basePrice + variation
      })

      return NextResponse.json({
        symbol: symbol.toUpperCase(),
        prices: mockPrices,
        dates: Array.from({ length: days }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (days - 1 - i))
          return date.toISOString().split('T')[0]
        })
      })
    }

    // Check cache
    const cacheKey = `history-${symbol}-${days}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const finnhub = new FinnhubClient(process.env.FINNHUB_API_KEY)
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    // Fetch candle data
    const candles = await finnhub.getCandles(
      symbol.toUpperCase(),
      'D', // Daily resolution
      Math.floor(startDate.getTime() / 1000),
      Math.floor(endDate.getTime() / 1000)
    )

    if (!candles || candles.s !== 'ok' || !candles.c) {
      // Return mock data if API fails
      const mockPrices = Array.from({ length: days }, (_, i) => {
        const basePrice = 100
        const variation = Math.sin(i / 5) * 10 + Math.random() * 5
        return basePrice + variation
      })

      return NextResponse.json({
        symbol: symbol.toUpperCase(),
        prices: mockPrices,
        dates: Array.from({ length: days }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (days - 1 - i))
          return date.toISOString().split('T')[0]
        })
      })
    }

    // Extract closing prices
    const result = {
      symbol: symbol.toUpperCase(),
      prices: candles.c, // Closing prices
      dates: candles.t.map((timestamp: number) => 
        new Date(timestamp * 1000).toISOString().split('T')[0]
      )
    }

    // Cache the result
    cache.set(cacheKey, { data: result, timestamp: Date.now() })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Stock history API error:', error)
    
    // Return mock data on error
    const days = parseInt(request.nextUrl.searchParams.get('days') || '30')
    const mockPrices = Array.from({ length: days }, (_, i) => {
      const basePrice = 120
      const variation = Math.sin(i / 5) * 10 + Math.random() * 5
      return basePrice + variation
    })

    return NextResponse.json({
      symbol: request.nextUrl.searchParams.get('symbol')?.toUpperCase() || 'UNKNOWN',
      prices: mockPrices,
      dates: Array.from({ length: days }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (days - 1 - i))
        return date.toISOString().split('T')[0]
      })
    })
  }
}