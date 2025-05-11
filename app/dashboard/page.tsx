"use client"
import { useAuth } from "@/components/auth-provider"
import { Dashboard } from "@/components/dashboard"
import { ChatProvider } from "@/contexts/chat-context"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [key, setKey] = useState(0) // Add a key to force re-render when conversation changes
  const router = useRouter()

  // Get conversation ID from URL if present and update when it changes
  useEffect(() => {
    if (searchParams) {
      const id = searchParams.get("conversation")

      // If the conversation ID has changed, update state and force re-render
      if (id !== conversationId) {
        console.log(`Conversation ID changed from ${conversationId} to ${id}`)
        setConversationId(id)
        setKey((prevKey) => prevKey + 1) // Increment key to force re-render
      }
    }
  }, [searchParams, conversationId])

  // Skip loading state for non-logged-in users
  if (authLoading && user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f0f10]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // Only pass conversation ID if user is logged in
  const initialConversationId = user && conversationId ? conversationId : null

  return (
    <ChatProvider key={key} initialConversationId={initialConversationId}>
      <Dashboard />
    </ChatProvider>
  )
}
