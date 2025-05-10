"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { SubscriptionProvider } from "@/components/subscription-provider"
import { PagesProvider } from "@/components/pages-provider"
import { LanguageProvider } from "@/contexts/language-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AuthProvider>
          <SubscriptionProvider>
            <PagesProvider>{children}</PagesProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  )
}
