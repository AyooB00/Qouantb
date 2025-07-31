import { NextResponse } from 'next/server'

export async function GET() {
  const providers = {
    openai: !!process.env.OPENAI_API_KEY,
    gemini: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)
  }

  return NextResponse.json(providers)
}