"use client"

import type { ReactNode } from "react"
import { Sidebar } from "@/components/sidebar"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)

  // Update the current conversation ID when the search params change
  useEffect(() => {
    const conversationId = searchParams.get("conversation")
    setCurrentConversationId(conversationId)
  }, [searchParams])

  // Update the handleConversationSelect function to ensure it's navigating correctly
  const handleConversationSelect = (id: string | null, title: string) => {
    // Use client-side navigation to prevent full page reloads
    if (id) {
      console.log("Navigating to conversation:", id)
      // Force a hard navigation to ensure the conversation loads properly
      window.location.href = `/dashboard?conversation=${id}`
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="flex h-screen flex-col bg-[#0f0f10] text-white">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={true}
          onConversationSelect={handleConversationSelect}
          currentConversationId={currentConversationId}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      {/* We removed the DebugPanel from here */}
    </div>
  )
}
