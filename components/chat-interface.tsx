"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import {
  FileText,
  Code,
  MessageSquare,
  Lightbulb,
  Paperclip,
  SmilePlus,
  Send,
  ChevronDown,
  AlertCircle,
  Lock,
  RefreshCw,
  X,
  Loader2,
  FileSearch,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageFormatter } from "./message-formatter"
import { useRouter, useSearchParams } from "next/navigation"
import { ErrorBoundary } from "./error-boundary"
import { useChat } from "@/contexts/chat-context"
import { RetryButton } from "./retry-button"

// Add this to the top of your chat-interface.tsx file
// This will ensure the styles are applied to the chat messages

import "./message-styles.css"

// Message display component with error handling
function MessageDisplay({ message }: { message: any }) {
  const { streamingMessageId, failedMessages, retryFailedMessage } = useChat()
  const isStreaming = message.id === streamingMessageId
  const isFailed = failedMessages.includes(message.id)

  return (
    <div
      className={`flex w-full ${
        message.role === "user" ? "justify-end" : message.role === "system" ? "justify-center" : ""
      }`}
    >
      {message.role === "system" ? (
        <div className={`rounded-lg bg-[#222] p-3 text-xs ${message.error ? "text-red-400" : "text-gray-400"}`}>
          <div className="flex items-center">
            {message.error ? <AlertCircle className="mr-2 h-4 w-4 text-red-400" /> : null}
            {message.content}
            {message.model && (
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  message.model === "ChatGPT" ? "bg-green-900/30 text-green-400" : "bg-blue-900/30 text-blue-400"
                }`}
              >
                {message.model}
              </span>
            )}
          </div>
        </div>
      ) : message.role === "user" ? (
        <div className="max-w-[80%] break-words rounded-lg bg-[#1a1a1a] text-white" style={{ padding: "12px 15px" }}>
          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
          <RetryButton messageId={message.id} />
        </div>
      ) : (
        <div className="w-full break-words text-white">
          <ErrorBoundary>
            <MessageFormatter content={message.content || ""} />
            {isStreaming && <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded-sm bg-gray-400"></span>}
            {!isStreaming && !message.content && (
              <div className="mt-2 flex justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-gray-700 hover:bg-gray-800/20 text-gray-300"
                  onClick={() => retryFailedMessage(message.id)}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </div>
            )}
          </ErrorBoundary>
          <div className="mt-1 flex justify-end">
            {message.model && (
              <span className={`text-[10px] ${message.model === "ChatGPT" ? "text-green-400" : "text-blue-400"}`}>
                {message.model}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Suggestions component
function Suggestions() {
  const { sendMessage, conversation } = useChat()
  const hasMessages = conversation.messages.length > 0
  const hasConversationId = !!conversation.id

  // If there are messages or we have a conversation with an ID, don't show suggestions
  if (hasMessages || hasConversationId) {
    return null
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <h1 className="mb-12 text-4xl font-bold text-white">What can I help with?</h1>

      <div className="flex max-w-xl flex-col gap-4">
        <SuggestionCard
          icon={<FileText className="h-5 w-5" />}
          title="Write a blog post"
          description="Write a blog post about AI trends in 2025"
          onClick={() => handleSuggestionClick("Write a blog post about AI trends in 2025")}
        />

        <SuggestionCard
          icon={<Code className="h-5 w-5" />}
          title="Help with code"
          description="Help me debug this JavaScript code"
          onClick={() => handleSuggestionClick("Help me debug this JavaScript code")}
        />

        <SuggestionCard
          icon={<MessageSquare className="h-5 w-5" />}
          title="Draft a message"
          description="Draft a professional response to a client complaint"
          onClick={() => handleSuggestionClick("Draft a professional response to a client complaint")}
        />

        <SuggestionCard
          icon={<Lightbulb className="h-5 w-5" />}
          title="Generate ideas"
          description="Generate ideas for my next social media campaign"
          onClick={() => handleSuggestionClick("Generate ideas for my next social media campaign")}
        />

        <SuggestionCard
          icon={<FileSearch className="h-5 w-5" />}
          title="Research a topic"
          description="Research the latest trends in artificial intelligence"
          onClick={() => handleSuggestionClick("Research the latest trends in artificial intelligence")}
        />

        <SuggestionCard
          icon={<BookOpen className="h-5 w-5" />}
          title="Explain a concept"
          description="Explain quantum computing in simple terms"
          onClick={() => handleSuggestionClick("Explain quantum computing in simple terms")}
        />
      </div>
    </div>
  )
}

// Loading indicator component
function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-4 text-sm text-gray-400">Loading conversation...</p>
      </div>
    </div>
  )
}

// Chat messages component
function ChatMessages() {
  const { conversation, isStreaming, streamingMessageId, isLoading } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [shouldHighlight, setShouldHighlight] = useState(false)
  const [hasMessages, setHasMessages] = useState(conversation.messages.length > 0)
  const [hasConversationId, setHasConversationId] = useState(!!conversation.id)

  // Update hasMessages when conversation.messages changes
  useEffect(() => {
    setHasMessages(conversation.messages.length > 0)
    setHasConversationId(!!conversation.id)
  }, [conversation.messages.length, conversation.id])

  // If there are no messages and no conversation ID, don't show this component
  const shouldRenderMessages = hasMessages || hasConversationId

  // Scroll to bottom when messages change or during streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })

    // Debug message ordering
    if (conversation.messages.length > 0) {
      console.log(
        "Messages in current order:",
        conversation.messages.map((m) => ({
          id: m.id,
          role: m.role,
          timestamp: m.timestamp,
          content: m.content.substring(0, 20) + "...",
        })),
      )
    }
  }, [conversation.messages, isStreaming])

  // Highlight code blocks
  useEffect(() => {
    setShouldHighlight(true)
  }, [conversation.messages])

  useEffect(() => {
    if (shouldHighlight && typeof window !== "undefined" && window.hljs) {
      setTimeout(() => {
        try {
          window.hljs.highlightAll()
        } catch (error) {
          console.error("Error highlighting code blocks:", error)
        }
      }, 100)
      setShouldHighlight(false)
    }
  }, [shouldHighlight])

  // Show loading indicator if loading
  if (isLoading) {
    return <LoadingIndicator />
  }

  // Don't show the "empty conversation" message if we have messages
  // This fixes the issue where the message appears when first sending a message
  if (hasMessages) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-col space-y-4">
          {conversation.messages.map((message) => (
            <ErrorBoundary key={message.id}>
              <MessageDisplay message={message} />
            </ErrorBoundary>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    )
  }

  // Show empty conversation message only if we have a conversation ID but no messages
  // AND we're not currently streaming (which would mean a message is being sent)
  if (hasConversationId && !hasMessages && !isStreaming) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-center text-gray-400">This conversation is empty. Start chatting below!</p>
        </div>
      </div>
    )
  }

  // Default case - no messages, no conversation ID
  return null
}

// Chat input component
function ChatInput() {
  const {
    sendMessage,
    isStreaming,
    selectedModel,
    changeModel,
    hasReachedLimit,
    isFreePlan,
    networkStatus,
    cancelRequest,
    dailyMessageCount,
    conversation,
    isLoading,
  } = useChat()
  const [inputValue, setInputValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get("conversation")

  // Function to handle sending messages
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      setIsSubmitting(true)

      try {
        // Send the message
        await sendMessage(content.trim())
      } finally {
        // Clear input immediately for better UX
        setInputValue("")
        setIsSubmitting(false)
      }
    },
    [sendMessage],
  )

  const handleSend = () => {
    if (inputValue.trim()) {
      handleSendMessage(inputValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Disable input during loading or streaming
  const isInputDisabled = isLoading || isStreaming || (hasReachedLimit && isFreePlan()) || networkStatus === "offline"

  return (
    <div className="p-4 flex flex-col items-center">
      {isFreePlan() && (
        <div className="mb-2 flex items-center justify-between rounded-md bg-gray-800 px-3 py-2 text-xs w-full max-w-3xl mx-auto">
          <div className="flex items-center">
            <Lock className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-300">
              {hasReachedLimit
                ? `Daily limit reached: ${dailyMessageCount}/10 messages`
                : `Free plan: ${dailyMessageCount}/10 messages used today`}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-6 bg-gray-700 px-2 py-0 text-xs text-gray-200 hover:bg-gray-600"
            onClick={() => router.push("/subscription")}
          >
            Upgrade
          </Button>
        </div>
      )}

      <div
        ref={inputContainerRef}
        className="flex flex-wrap items-center rounded-lg border border-[#1a1a1a] bg-[#1a1a1a] px-4 py-2 w-full max-w-3xl mx-auto"
      >
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hasReachedLimit && isFreePlan() ? "Upgrade to send more messages" : "Ask a follow up..."}
          className="min-w-[150px] flex-1 border-0 bg-transparent text-sm text-white shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={isInputDisabled}
        />
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            className="rounded p-2 transition-colors duration-200 hover:bg-[#1a1a1a] hover:text-white"
            disabled={isInputDisabled}
          >
            <Paperclip className={`h-5 w-5 ${isInputDisabled ? "text-gray-600" : "text-gray-400"}`} />
          </button>
          <button
            className="rounded p-2 transition-colors duration-200 hover:bg-[#1a1a1a] hover:text-white"
            disabled={isInputDisabled}
          >
            <SmilePlus className={`h-5 w-5 ${isInputDisabled ? "text-gray-600" : "text-gray-400"}`} />
          </button>
          <div className="mx-1 h-6 w-px bg-[#333]"></div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="z-50">
                <button
                  type="button"
                  className={`flex items-center gap-1 rounded px-2 py-1 text-sm transition-colors duration-200 hover:bg-[#333] focus:outline-none ${isInputDisabled ? "opacity-50" : ""}`}
                >
                  <span className={selectedModel === "ChatGPT" ? "text-green-400" : "text-blue-400"}>
                    {selectedModel}
                  </span>
                  <ChevronDown className={`h-4 w-4 ${isInputDisabled ? "text-gray-600" : "text-gray-400"}`} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                sideOffset={5}
                align="end"
                className="z-[100] min-w-[8rem] bg-gray-900 text-white border border-[#333]"
              >
                <DropdownMenuItem
                  onSelect={() => changeModel("ChatGPT")}
                  className={`cursor-pointer ${selectedModel === "ChatGPT" ? "bg-black/40 text-green-400" : ""} hover:bg-[#1a1a1a] focus:bg-[#1a1a1a]`}
                >
                  ChatGPT
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => changeModel("Gemini")}
                  className={`cursor-pointer ${selectedModel === "Gemini" ? "bg-black/40 text-blue-400" : ""} hover:bg-[#1a1a1a] focus:bg-[#1a1a1a]`}
                >
                  Gemini
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {isStreaming ? (
              <button
                onClick={cancelRequest}
                className="rounded p-2 transition-colors duration-200 hover:bg-red-900/20 text-red-400"
                title="Cancel request"
              >
                <X className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isSubmitting || isInputDisabled}
                className={`rounded p-2 transition-colors duration-200 hover:bg-[#1a1a1a] hover:text-white ${
                  !inputValue.trim() || isSubmitting || isInputDisabled ? "opacity-50" : ""
                }`}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                ) : (
                  <Send className={`h-5 w-5 ${isInputDisabled ? "text-gray-600" : "text-gray-400"}`} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="mt-2 text-center text-xs text-gray-500 w-full max-w-3xl mx-auto">
        Allais may make mistakes. Please use with discretion.
      </div>
    </div>
  )
}

// Network status alert
function NetworkAlert() {
  const { networkStatus } = useChat()

  if (networkStatus === "online") return null

  return (
    <div className="bg-yellow-900/20 border border-yellow-800 m-4 p-3 rounded-md">
      <div className="flex items-center">
        <AlertCircle className="h-4 w-4 text-yellow-400 mr-2" />
        <span className="text-yellow-300 text-sm">
          You're currently offline. Messages will not be sent until your connection is restored.
        </span>
      </div>
    </div>
  )
}

// Error alert
function ErrorAlert() {
  const { error, loadConversation, conversation } = useChat()
  const [isRetrying, setIsRetrying] = useState(false)

  if (!error) return null

  const handleRetry = async () => {
    setIsRetrying(true)
    if (conversation.id) {
      await loadConversation(conversation.id)
    }
    setIsRetrying(false)
  }

  return (
    <div className="bg-red-900/20 border border-red-800 m-4 p-3 rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
          <span className="text-red-300 text-sm">{error || "Something went wrong. Please try again."}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          disabled={isRetrying}
          className="bg-transparent border-red-800 hover:bg-red-800/20 text-red-300"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Main chat interface component
export function ChatInterface() {
  return <ChatInterfaceInner />
}

// Inner chat interface component (uses context)
function ChatInterfaceInner() {
  const { conversation } = useChat()
  const [renderKey, setRenderKey] = useState(0)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Debug logging
  useEffect(() => {
    console.log("ChatInterfaceInner rendering with conversation:", conversation)
  }, [conversation])

  // Force re-render if needed
  useEffect(() => {
    const handleError = () => {
      setRenderKey((prev) => prev + 1)
    }

    window.addEventListener("chat-error", handleError)
    return () => {
      window.removeEventListener("chat-error", handleError)
    }
  }, [])

  if (!hasMounted) {
    return null
  }

  return (
    <ErrorBoundary>
      <div className="flex h-full flex-col" key={renderKey}>
        <NetworkAlert />
        <ErrorAlert />

        <div className="flex flex-1 flex-col overflow-auto p-4">
          {/* Show ChatMessages if we have messages or a conversation ID */}
          <ChatMessages />

          {/* Show Suggestions only if we don't have messages and don't have a conversation ID */}
          <Suggestions />
        </div>

        <ChatInput />
      </div>
    </ErrorBoundary>
  )
}

interface SuggestionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}

function SuggestionCard({ icon, title, description, onClick }: SuggestionCardProps) {
  return (
    <Button
      variant="outline"
      className="flex h-auto w-full items-start justify-start gap-4 border-[#333] bg-transparent p-4 text-left transition-all duration-200 hover:border-[#333] hover:bg-[#1a1a1a]"
      onClick={onClick}
    >
      <div className="mt-1">{icon}</div>
      <div>
        <h3 className="font-medium text-white">{title}</h3>
        <p className="mt-1 text-sm text-gray-400">{description}</p>
      </div>
    </Button>
  )
}
