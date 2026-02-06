import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

// Define protected routes
const protectedRoutes = ['/dashboard', '/admin', '/posts/new']
const adminRoutes = ['/admin']
const superAdminRoutes = ['/admin/users']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get session
  const session = await auth()

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Redirect to login if not authenticated
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check if user is active
  if (session && !session.user.isActive) {
    return NextResponse.redirect(new URL('/login?error=AccountDeactivated', request.url))
  }

  // Check admin routes
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  if (isAdminRoute && session) {
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard?error=Unauthorized', request.url))
    }
  }

  // Check super admin routes
  const isSuperAdminRoute = superAdminRoutes.some(route => pathname.startsWith(route))
  if (isSuperAdminRoute && session) {
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin?error=SuperAdminOnly', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
