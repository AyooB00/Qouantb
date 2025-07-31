import { NextResponse } from 'next/server'
import { finChatTools } from '@/lib/finchat/tools'

export async function GET() {
  try {
    const marketData = await finChatTools.get_market_overview()
    
    if ('error' in marketData) {
      return NextResponse.json(
        { error: marketData.error },
        { status: 500 }
      )
    }
    
    return NextResponse.json(marketData)
  } catch (error) {
    console.error('Market overview API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market overview' },
      { status: 500 }
    )
  }
}