import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// List of protected routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/profile", "/settings", "/subscription", "/pages"]

// Patterns for dynamic protected routes
const PROTECTED_DYNAMIC_ROUTE_PATTERNS = [
  /^\/dashboard\?conversation=[a-zA-Z0-9-]+$/, // Dashboard with conversation parameter
  /^\/pages\/[a-zA-Z0-9-]+$/, // Pages with ID parameter
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Get the pathname
  const { pathname, search } = new URL(req.url)
  const fullPath = search ? `${pathname}${search}` : pathname

  // Check if this is a static asset or API route
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // Files like favicon.ico, etc.
  ) {
    return res
  }

  // Allow all routes by default, only check authentication for protected routes
  const isProtectedRoute =
    PROTECTED_ROUTES.includes(pathname) ||
    PROTECTED_DYNAMIC_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname) || pattern.test(fullPath))

  if (isProtectedRoute) {
    try {
      // Refresh session if expired
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // If no session and trying to access protected route, redirect to login
      if (!session && isProtectedRoute) {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    } catch (error) {
      // If there's an auth error, just continue without throwing
      console.error("Auth error in middleware:", error)
    }
  }

  return res
}

// Apply middleware to all routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
