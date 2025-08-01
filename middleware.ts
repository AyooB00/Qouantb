import { NextRequest, NextResponse } from 'next/server'
import { LANGUAGE_COOKIE_NAME } from '@/lib/language-preferences'

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for API routes, static files, etc.
  if (
    pathname.includes('/api/') ||
    pathname.includes('/_next/') ||
    pathname.includes('/_vercel/') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  // Get the response
  const response = NextResponse.next()
  
  // Check if user has a language preference cookie
  const cookieLocale = request.cookies.get(LANGUAGE_COOKIE_NAME)?.value
  
  // If no language cookie, set default to 'en'
  if (!cookieLocale) {
    response.cookies.set(LANGUAGE_COOKIE_NAME, 'en', {
      path: '/',
      sameSite: 'lax',
      // Session cookie - no maxAge
    })
  }
  
  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}