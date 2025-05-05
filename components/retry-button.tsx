"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChat } from "@/contexts/chat-context"

interface RetryButtonProps {
  messageId: string
}

export function RetryButton({ messageId }: RetryButtonProps) {
  const { retryFailedMessage, failedMessages } = useChat()
  const isFailed = failedMessages.includes(messageId)

  if (!isFailed) return null

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => retryFailedMessage(messageId)}
      className="mt-2 bg-transparent border-red-800 hover:bg-red-800/20 text-red-300"
    >
      <RefreshCw className="h-3 w-3 mr-1" />
      Retry
    </Button>
  )
}
