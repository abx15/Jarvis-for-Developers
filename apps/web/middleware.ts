import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/']
// Define auth routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get token from cookies or headers
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // If user has token and is trying to access auth routes, redirect to dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user doesn't have token and is trying to access protected routes, redirect to login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    // Add the original URL as a query parameter for redirect after login
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Allow the request to proceed
  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
