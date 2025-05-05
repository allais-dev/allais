"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { v4 as uuidv4 } from "uuid"
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
export function ChatProvider({ children }: { children: React.ReactNode }) {
  // State for messages, loading status, and selected model
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AIModel>("ChatGPT") // Changed default from Gemini to ChatGPT
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [dailyMessageCount, setDailyMessageCount] = useState(0)
  const maxDailyMessages = 50 // Maximum number of messages per day
  const [hasReachedDailyLimit, setHasReachedDailyLimit] = useState(false)

  // Get the current user from auth context
  const { user } = useAuth()
  const { toast } = useToast()

  // Refs for tracking streaming state
  const streamingMessageRef = useRef<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load daily message count on mount and when user changes
  useEffect(() => {
    if (user) {
      loadDailyMessageCount()
    }
  }, [user])

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
      if (!content.trim() && (!files || files.length === 0)) return
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to send messages",
          variant: "destructive",
        })
        return
      }

      if (hasReachedDailyLimit) {
        toast({
          title: "Daily Limit Reached",
          description: `You've reached your limit of ${maxDailyMessages} messages per day.`,
          variant: "destructive",
        })
        return
      }

      // Create a new user message
      const userMessage: Message = {
        id: uuidv4(),
        content,
        role: "user",
        timestamp: new Date(),
        files,
      }

      // Create a placeholder for the assistant's response
      const assistantMessage: Message = {
        id: uuidv4(),
        content: "",
        role: "assistant",
        timestamp: new Date(),
        model: selectedModel,
        isStreaming: true,
      }

      // Add the messages to the state
      setMessages((prev) => [...prev, userMessage, assistantMessage])

      // Set loading state
      setIsLoading(true)

      // Store the ID of the streaming message
      streamingMessageRef.current = assistantMessage.id

      try {
        // Check if this is a new conversation
        const isNewConversation = !currentConversationId
        let conversationId = currentConversationId

        // If this is a new conversation, create one
        if (isNewConversation && user) {
          // Use the first few words of the message as the title
          const title = content.split(" ").slice(0, 5).join(" ") + "..."
          conversationId = await apiClient.createConversation(user.id, title)
          if (conversationId) {
            setCurrentConversationId(conversationId)
          }
        }

        // Function to handle streaming chunks
        const handleChunk = (chunk: string) => {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === assistantMessage.id) {
                return {
                  ...msg,
                  content: msg.content + chunk,
                }
              }
              return msg
            }),
          )
        }

        // Function to handle completion
        const handleComplete = (fullText: string) => {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === assistantMessage.id) {
                return {
                  ...msg,
                  content: fullText,
                  isStreaming: false,
                }
              }
              return msg
            }),
          )

          // Clear the streaming message ref
          streamingMessageRef.current = null

          // Save the messages to the database if we have a conversation ID
          if (conversationId) {
            apiClient.saveMessages(conversationId, userMessage, {
              ...assistantMessage,
              content: fullText,
              isStreaming: false,
            })
          }

          // Update the daily message count
          setDailyMessageCount((prev) => prev + 1)

          // Set loading state
          setIsLoading(false)
        }

        // Function to handle errors
        const handleError = (error: string) => {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === assistantMessage.id) {
                return {
                  ...msg,
                  content: `Error: ${error}`,
                  error: true,
                  isStreaming: false,
                }
              }
              return msg
            }),
          )

          // Clear the streaming message ref
          streamingMessageRef.current = null

          // Set loading state
          setIsLoading(false)

          // Show an error toast
          toast({
            title: "Error",
            description: `Failed to get a response: ${error}`,
            variant: "destructive",
          })
        }

        // Send the message to the API
        await apiClient.streamMessage(
          content,
          selectedModel,
          user.id,
          handleChunk,
          handleComplete,
          handleError,
          conversationId,
          isNewConversation,
          messages,
          files,
        )
      } catch (error: any) {
        console.error("Error sending message:", error)

        // Update the assistant message with the error
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === assistantMessage.id) {
              return {
                ...msg,
                content: `Error: ${error.message || "Unknown error"}`,
                error: true,
                isStreaming: false,
              }
            }
            return msg
          }),
        )

        // Clear the streaming message ref
        streamingMessageRef.current = null

        // Set loading state
        setIsLoading(false)

        // Show an error toast
        toast({
          title: "Error",
          description: `Failed to send message: ${error.message || "Unknown error"}`,
          variant: "destructive",
        })
      }
    },
    [user, selectedModel, currentConversationId, messages, toast, hasReachedDailyLimit, maxDailyMessages],
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
      if (!user) return false

      try {
        // Reset the current chat
        resetChat()

        // Set loading state
        setIsLoading(true)

        // Load the conversation
        const conversation = await apiClient.fetchConversation(conversationId, user.id)

        // If the conversation was loaded successfully
        if (conversation) {
          console.log(
            "Setting messages from conversation:",
            conversation.messages.map((m) => ({ id: m.id.substring(0, 8), role: m.role })),
          )

          // Make sure we have messages
          if (conversation.messages.length > 0) {
            setMessages(conversation.messages)
          } else {
            console.warn("Conversation loaded but has no messages")
          }

          // Set the conversation ID
          setCurrentConversationId(conversation.id)

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
    [user, resetChat],
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
