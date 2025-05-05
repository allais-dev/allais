"use client"

import { useEffect, useState, useRef } from "react"
import { useChat } from "@/contexts/chat-context"
import { ChatInterface } from "@/components/chat-interface"
import { useRouter } from "next/navigation"

export const Dashboard = () => {
  const { conversation, loadConversation } = useChat()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const loadedConversationRef = useRef<string | null>(null)

  useEffect(() => {
    const fetchConversation = async () => {
      // Get conversation ID from URL
      const params = new URLSearchParams(window.location.search)
      const conversationId = params.get("conversation")

      // Only load if:
      // 1. We have a conversation ID
      // 2. It's different from current conversation ID
      // 3. We haven't already tried to load this specific ID (prevents loops)
      if (conversationId && conversationId !== conversation?.id && conversationId !== loadedConversationRef.current) {
        // Mark this ID as being loaded
        loadedConversationRef.current = conversationId

        setIsLoading(true)
        try {
          console.log("Dashboard: Loading conversation:", conversationId)
          await loadConversation(conversationId)
        } catch (error) {
          console.error("Error loading conversation in Dashboard:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchConversation()
  }, [conversation?.id]) // Only depend on conversation.id, not loadConversation

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white mx-auto"></div>
              <p className="mt-4 text-white">Loading conversation...</p>
            </div>
          </div>
        ) : (
          <ChatInterface />
        )}
      </div>
    </div>
  )
}

export default Dashboard
