"use client"

import { useEffect } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { useChat } from "@/contexts/chat-context"

export function Dashboard() {
  const { currentConversationId } = useChat()

  // Log the current conversation ID for debugging
  useEffect(() => {
    console.log("Dashboard rendering with conversation ID:", currentConversationId)
  }, [currentConversationId])

  return (
    <div className="flex h-full flex-col">
      <ChatInterface />
    </div>
  )
}
