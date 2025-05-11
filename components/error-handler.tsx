"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { notFound } from "next/navigation"

// List of valid routes in the application
const VALID_ROUTES = [
  "/",
  "/dashboard",
  "/login",
  "/register",
  "/profile",
  "/settings",
  "/subscription",
  "/pages",
  "/test", // Keep the test page
  "/not-found", // Add this to ensure the not-found page itself is considered valid
]

// Routes that have dynamic parameters
const DYNAMIC_ROUTE_PATTERNS = [
  /^\/dashboard\?conversation=[a-zA-Z0-9-]+$/, // Dashboard with conversation parameter
  /^\/pages\/[a-zA-Z0-9-]+$/, // Pages with ID parameter
]

export function ErrorHandler() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Get the path without query parameters
    const path = pathname.split("?")[0]

    // Check if the current path is valid
    const isValidStaticRoute = VALID_ROUTES.includes(path)

    // Check if it matches any dynamic route pattern
    const isValidDynamicRoute = DYNAMIC_ROUTE_PATTERNS.some((pattern) => {
      // Test just the pathname without query params for dynamic routes
      return pattern.test(path)
    })

    // Check for dashboard with conversation parameter
    const isDashboardWithConversation = path === "/dashboard" && pathname.includes("conversation=")

    // Add some debugging
    console.log({
      path,
      isValidStaticRoute,
      isValidDynamicRoute,
      isDashboardWithConversation,
      shouldShow404: !isValidStaticRoute && !isValidDynamicRoute && !isDashboardWithConversation,
    })

    // If the route is not valid, show the 404 page
    if (!isValidStaticRoute && !isValidDynamicRoute && !isDashboardWithConversation) {
      console.log("Triggering 404 page for invalid route:", path)
      notFound()
    }
  }, [pathname])

  return null
}
