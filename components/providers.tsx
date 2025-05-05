"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { PagesProvider } from "@/components/pages-provider"
import { SubscriptionProvider } from "@/components/subscription-provider"
import { Toaster } from "@/components/ui/toaster"
import { ChatProvider } from "@/contexts/chat-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="allais-theme">
        <SubscriptionProvider>
          <PagesProvider>
            <ChatProvider>
              {children}
              <Toaster />
            </ChatProvider>
          </PagesProvider>
        </SubscriptionProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
