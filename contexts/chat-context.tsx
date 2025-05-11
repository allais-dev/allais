"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { apiClient, type Message, type AIModel } from "@/utils/api-client"

// Define the shape of our chat context
interface ChatContextType {
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  isLoading: boolean
  selectedModel: AIModel
  setSelectedModel: React.Dispatch<React.SetStateAction<AIModel>>
  sendMessage: (content: string, files?: File[]) => Promise<void>
  resetChat: () => void
  currentConversationId: string | null
  setCurrentConversationId: React.Dispatch<React.SetStateAction<string | null>>
  loadConversation: (conversationId: string) => Promise<boolean>
  deleteConversation: (conversationId: string) => Promise<boolean>
  dailyMessageCount: number
  maxDailyMessages: number
  hasReachedDailyLimit: boolean
  retryFailedMessage: (messageId: string) => void
}

// Create the context with a default value
const ChatContext = createContext<ChatContextType | undefined>(undefined)

// Custom hook to use the chat context
export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}

// Provider component that wraps the app and provides the chat context
interface ChatProviderProps {
  children: React.ReactNode
  initialConversationId?: string | null
}

export function ChatProvider({ children, initialConversationId = null }: ChatProviderProps) {
  // State for messages, loading status, and selected model
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AIModel>("ChatGPT") // Changed default from Gemini to ChatGPT
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(initialConversationId)
  const [dailyMessageCount, setDailyMessageCount] = useState(0)
  const maxDailyMessages = 50 // Maximum number of messages per day
  const [hasReachedDailyLimit, setHasReachedDailyLimit] = useState(false)
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const initialLoadAttempted = useRef(false)

  // Get the current user from auth context
  const { user } = useAuth()
  const { toast } = useToast()

  // Refs for tracking streaming state
  const streamingMessageRef = useRef<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load daily message count on mount and when user changes
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (user) {
          // If user is logged in, load their data
          const dailyCount = await apiClient.fetchDailyMessageCount(user.id)
          setDailyMessageCount(dailyCount)

          // Ensure user profile exists if logged in
          await apiClient.ensureUserProfile(user.id, user.email)
        } else {
          // For non-logged in users, set default values
          setDailyMessageCount(0)
          // No need to check for subscription since they're not logged in
        }

        setIsDataLoaded(true)
      } catch (error) {
        console.error("Error loading user data:", error)
        setIsDataLoaded(true) // Still mark as loaded even if there's an error
      }
    }

    if (!isLoading) {
      loadUserData()
    }
  }, [user, isLoading])

  // Load initial conversation if provided
  useEffect(() => {
    const loadInitialConversation = async () => {
      if (initialConversationId && user && !initialLoadAttempted.current) {
        initialLoadAttempted.current = true
        console.log("Loading initial conversation:", initialConversationId)
        try {
          await loadConversation(initialConversationId)
        } catch (error) {
          console.error("Error loading initial conversation:", error)
        }
      }
    }

    if (isDataLoaded && !isLoading) {
      loadInitialConversation()
    }
  }, [initialConversationId, user, isDataLoaded, isLoading])

  useEffect(() => {
    setHasReachedDailyLimit(dailyMessageCount >= maxDailyMessages)
  }, [dailyMessageCount, maxDailyMessages])

  // Load the daily message count from the API
  const loadDailyMessageCount = useCallback(async () => {
    if (!user) return

    try {
      const count = await apiClient.fetchDailyMessageCount(user.id)
      setDailyMessageCount(count)
    } catch (error) {
      console.error("Error loading daily message count:", error)
    }
  }, [user])

  // Function to retry a failed message
  const retryFailedMessage = useCallback(
    (messageId: string) => {
      // Find the failed message
      const failedMessage = messages.find((msg) => msg.id === messageId)
      if (!failedMessage) return

      // Find the user message that preceded it
      const userMessageIndex = messages.findIndex((msg) => msg.id === messageId) - 1
      if (userMessageIndex < 0) return

      const userMessage = messages[userMessageIndex]
      if (userMessage.role !== "user") return

      // Remove the failed message and all messages after it
      setMessages((prev) => prev.filter((_, index) => index <= userMessageIndex))

      // Resend the user message
      sendMessage(userMessage.content, userMessage.files)
    },
    [messages],
  )

  // Function to send a message
  const sendMessage = useCallback(
    async (content: string, files?: File[]) => {
      if (isLoading || isSending) return

      try {
        setIsSending(true)

        // Generate a unique ID for this message
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

        // Create user message
        const userMessage: Message = {
          id: messageId,
          content,
          role: "user",
          timestamp: new Date(),
          files,
          userId: user?.id || "anonymous", // Add userId to track message ownership
        }

        // Add user message to state
        setMessages((prev) => [...prev, userMessage])

        // Create a placeholder for the assistant's response
        const assistantMessageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

        // Create assistant message with streaming flag
        const assistantMessage: Message = {
          id: assistantMessageId,
          content: "",
          role: "assistant",
          timestamp: new Date(),
          model: selectedModel,
          isStreaming: true,
          userId: user?.id || "anonymous", // Add userId to track message ownership
        }

        // Add assistant message to state
        setMessages((prev) => [...prev, assistantMessage])

        // Scroll to bottom
        setTimeout(() => {
          const chatContainer = document.querySelector(".chat-container")
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight
          }
        }, 100)

        let streamedContent = ""

        // Create a new conversation if needed
        let conversationIdToUse = currentConversationId
        if (!conversationIdToUse) {
          try {
            // Create a new conversation with a title based on the first message
            const title = content.length > 30 ? content.substring(0, 30) + "..." : content
            const newConversationId = await apiClient.createConversation(user?.id || "anonymous", title)
            if (newConversationId) {
              conversationIdToUse = newConversationId
              setCurrentConversationId(newConversationId)
              console.log("Created new conversation:", newConversationId)
            }
          } catch (error) {
            console.error("Error creating new conversation:", error)
          }
        }

        // Stream the response
        await apiClient.streamMessage(
          content,
          selectedModel,
          user?.id || "anonymous", // Use "anonymous" for non-logged in users
          (chunk) => {
            // Update content as it streams in
            streamedContent += chunk
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: streamedContent,
                    }
                  : msg,
              ),
            )
          },
          (fullText) => {
            // Update with the complete response
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: fullText,
                      isStreaming: false,
                    }
                  : msg,
              ),
            )

            // Save messages for both logged-in and non-logged-in users
            if (conversationIdToUse) {
              console.log("Saving messages to conversation:", conversationIdToUse)
              apiClient.saveMessages(conversationIdToUse, userMessage, {
                ...assistantMessage,
                content: fullText,
                isStreaming: false,
              })
            } else {
              console.log("Not saving messages - conversationId missing", {
                userId: user?.id || "anonymous",
                conversationId: conversationIdToUse,
              })
            }

            // Increment message count for logged-in users
            if (user) {
              setDailyMessageCount((prev) => prev + 1)
            }
          },
          (error) => {
            // Handle errors
            console.error("Error streaming message:", error)
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: `Error: ${error}`,
                      error: true,
                      isStreaming: false,
                    }
                  : msg,
              ),
            )
          },
          conversationIdToUse,
          !conversationIdToUse, // isNewConversation
          messages, // conversation history
        )
      } catch (error) {
        console.error("Error sending message:", error)
        // Dispatch error event
        window.dispatchEvent(
          new CustomEvent("chat-error", {
            detail: { message: "Failed to send message. Please try again." },
          }),
        )
      } finally {
        setIsSending(false)
      }
    },
    [messages, selectedModel, currentConversationId, isLoading, isSending, user],
  )

  // Function to reset the chat
  const resetChat = useCallback(() => {
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Reset the messages
    setMessages([])

    // Reset the conversation ID
    setCurrentConversationId(null)

    // Reset the streaming message ref
    streamingMessageRef.current = null

    // Reset loading state
    setIsLoading(false)
  }, [])

  // Function to load a conversation
  const loadConversation = useCallback(
    async (conversationId: string): Promise<boolean> => {
      try {
        // Set loading state
        setIsLoading(true)

        // Reset the messages first to clear the previous conversation
        setMessages([])

        // Set the conversation ID immediately to prevent multiple loads
        setCurrentConversationId(conversationId)

        // If user is not logged in, we can't load conversations from the database
        if (!user) {
          console.log("User not logged in, cannot load conversation")
          setIsLoading(false)
          return false
        }

        console.log(`Loading conversation: ${conversationId} for user: ${user.id}`)

        // Load the conversation
        const conversation = await apiClient.fetchConversation(conversationId, user.id)

        // If the conversation was loaded successfully
        if (conversation) {
          console.log(
            "Setting messages from conversation:",
            conversation.messages.map((m) => ({ id: m.id?.substring(0, 8), role: m.role })),
          )

          // Make sure we have messages
          if (conversation.messages.length > 0) {
            setMessages(conversation.messages)
          } else {
            console.warn("Conversation loaded but has no messages")
          }

          // Set loading state
          setIsLoading(false)

          return true
        }

        // Set loading state
        setIsLoading(false)

        return false
      } catch (error) {
        console.error("Error loading conversation:", error)

        // Set loading state
        setIsLoading(false)

        return false
      }
    },
    [user],
  )

  // Function to delete a conversation
  const deleteConversation = useCallback(
    async (conversationId: string): Promise<boolean> => {
      if (!user) return false

      try {
        // Delete the conversation
        const success = await apiClient.deleteConversation(conversationId, user.id)

        // If the conversation was deleted successfully and it was the current conversation
        if (success && conversationId === currentConversationId) {
          // Reset the chat
          resetChat()
        }

        return success
      } catch (error) {
        console.error("Error deleting conversation:", error)
        return false
      }
    },
    [user, currentConversationId, resetChat],
  )

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [])

  // Create the context value
  const contextValue: ChatContextType = {
    messages,
    setMessages,
    isLoading,
    selectedModel,
    setSelectedModel,
    sendMessage,
    resetChat,
    currentConversationId,
    setCurrentConversationId,
    loadConversation,
    deleteConversation,
    dailyMessageCount,
    maxDailyMessages,
    hasReachedDailyLimit,
    retryFailedMessage,
  }

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
}
