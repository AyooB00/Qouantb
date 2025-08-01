import { NextResponse } from 'next/server'
import { finChatTools } from '@/lib/finchat/tools'
import { handleAPIError, APIError } from '@/lib/api/error-handler'

export async function GET() {
  try {
    const marketData = await finChatTools.get_market_overview()
    
    if ('error' in marketData) {
      throw new APIError(marketData.error || 'Unknown error', 500, 'MARKET_DATA_ERROR')
    }
    
    return NextResponse.json(marketData)
  } catch (error) {
    return handleAPIError(error)
  }
}