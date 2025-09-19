import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Public routes that don't require authentication
    const publicRoutes = [
      '/',
      '/auth/signin',
      '/auth/register',
      '/auth/error',
      '/api/auth',
      '/api/test-db',
      '/api/test-auth'
    ]

    // Check if route is public
    const isPublicRoute = publicRoutes.some(route => 
      pathname.startsWith(route)
    )

    // Allow public routes
    if (isPublicRoute) {
      return NextResponse.next()
    }

    // Require authentication for protected routes
    if (!token) {
      const signInUrl = new URL('/auth/signin', req.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Role-based access control
    const userRole = token.role as string

    // Admin-only routes
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Client-only routes
    if (pathname.startsWith('/client')) {
      if (userRole !== 'CLIENT') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Expert-only routes
    if (pathname.startsWith('/expert')) {
      if (userRole !== 'EXPERT') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Dashboard access - redirect based on role and profile completion
    if (pathname === '/dashboard') {
      const profileComplete = token.profileComplete as boolean

      if (!profileComplete) {
        // Redirect to profile setup based on role
        if (userRole === 'CLIENT') {
          return NextResponse.redirect(new URL('/client/profile/setup', req.url))
        } else if (userRole === 'EXPERT') {
          return NextResponse.redirect(new URL('/expert/profile/setup', req.url))
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // This runs before the middleware function
        // Return true to allow the middleware to run
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
