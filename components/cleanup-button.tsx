"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/auth-provider"

export function CleanupButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const { user } = useAuth()

  const handleCleanup = async () => {
    if (!user) {
      setResult("You must be logged in to perform this action")
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      // Step 1: Get all conversations for this user
      const { data: conversations, error: fetchError } = await supabase
        .from("chat_conversations")
        .select("id, title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })

      if (fetchError) {
        throw new Error(`Error fetching conversations: ${fetchError.message}`)
      }

      // Step 2: Find duplicates by title
      const titleMap = new Map()
      const duplicates = []

      for (const conv of conversations) {
        if (titleMap.has(conv.title)) {
          // This is a duplicate
          duplicates.push(conv.id)
        } else {
          titleMap.set(conv.title, conv.id)
        }
      }

      if (duplicates.length === 0) {
        setResult("No duplicate conversations found")
        setIsLoading(false)
        return
      }

      // Step 3: For each duplicate, get its messages
      for (const dupId of duplicates) {
        // Get the original conversation ID for this title
        const { data: messages, error: messagesError } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("conversation_id", dupId)

        if (messagesError) {
          console.error(`Error fetching messages for conversation ${dupId}:`, messagesError)
          continue
        }

        // Delete the duplicate conversation
        const { error: deleteError } = await supabase.from("chat_conversations").delete().eq("id", dupId)

        if (deleteError) {
          console.error(`Error deleting duplicate conversation ${dupId}:`, deleteError)
        }
      }

      setResult(`Successfully cleaned up ${duplicates.length} duplicate conversations`)
    } catch (error) {
      console.error("Error during cleanup:", error)
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="px-3 py-2">
      <Button
        variant="outline"
        className="flex w-full items-center justify-start gap-2 border-[#333] bg-transparent text-white transition-all duration-200 hover:border-[#333] hover:bg-[#1a1a1a]"
        onClick={handleCleanup}
        disabled={isLoading}
      >
        <Trash2 className="h-4 w-4" />
        <span>{isLoading ? "Cleaning up..." : "Clean up duplicates"}</span>
      </Button>
      {result && <p className="mt-2 text-xs text-gray-400">{result}</p>}
    </div>
  )
}
