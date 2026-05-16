import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/login')) {
    const cookie = request.cookies.get('tabletalk_demo_auth')
    const expected = process.env.DASHBOARD_DEMO_PASSWORD

    if (!cookie || !expected || cookie.value !== expected) {
      const loginUrl = new URL('/dashboard/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
