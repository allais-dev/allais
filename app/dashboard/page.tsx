"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Dashboard } from "@/components/dashboard"
import { ChatProvider } from "@/contexts/chat-context"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [initialConversation, setInitialConversation] = useState(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f0f10]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <ChatProvider initialConversation={initialConversation}>
      <Dashboard />
    </ChatProvider>
  )
}
