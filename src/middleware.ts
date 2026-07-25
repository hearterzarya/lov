import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('admin_session')

  if (!session || session.value !== process.env.ADMIN_SESSION_TOKEN) {
    if (request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
}

export const config = {
  matcher: ['/admin/:path*']
}
