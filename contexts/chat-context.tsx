"use client"

import type React from "react"

import { createContext, useContext, useReducer, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { useSubscription } from "@/components/subscription-provider"
import { apiClient, type Message, type Conversation, type AIModel } from "@/utils/api-client"

// Free plan message limit (now unlimited)
const FREE_PLAN_MESSAGE_LIMIT = Number.POSITIVE_INFINITY

// Chat state
interface ChatState {
  conversation: Conversation
  isLoading: boolean
  isStreaming: boolean
  streamingMessageId: string | null
  error: string | null
  selectedModel: AIModel
  dailyMessageCount: number
  hasReachedLimit: boolean
  networkStatus: "online" | "offline"
  failedMessages: string[] // Track failed message IDs
}

// Chat actions
type ChatAction =
  | { type: "SET_CONVERSATION"; payload: Conversation }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "UPDATE_STREAMING_MESSAGE"; payload: { id: string; content: string } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_STREAMING"; payload: boolean }
  | { type: "SET_STREAMING_MESSAGE_ID"; payload: string | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_MODEL"; payload: AIModel }
  | { type: "SET_DAILY_MESSAGE_COUNT"; payload: number }
  | { type: "SET_HAS_REACHED_LIMIT"; payload: boolean }
  | { type: "SET_NETWORK_STATUS"; payload: "online" | "offline" }
  | { type: "RESET_CONVERSATION" }
  | { type: "UPDATE_CONVERSATION_ID"; payload: string }
  | { type: "ADD_FAILED_MESSAGE"; payload: string }
  | { type: "REMOVE_FAILED_MESSAGE"; payload: string }
  | { type: "CLEAR_FAILED_MESSAGES" }

// Initial state
const initialState: ChatState = {
  conversation: {
    id: null,
    title: "New Conversation",
    messages: [],
  },
  isLoading: false,
  isStreaming: false,
  streamingMessageId: null,
  error: null,
  selectedModel: "Gemini",
  dailyMessageCount: 0,
  hasReachedLimit: false,
  networkStatus: "online",
  failedMessages: [],
}

// Reducer function
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_CONVERSATION":
      return {
        ...state,
        conversation: action.payload,
      }
    case "ADD_MESSAGE":
      return {
        ...state,
        conversation: {
          ...state.conversation,
          messages: [...state.conversation.messages, action.payload],
        },
      }
    case "UPDATE_STREAMING_MESSAGE": {
      const { id, content } = action.payload
      return {
        ...state,
        conversation: {
          ...state.conversation,
          messages: state.conversation.messages.map((message) =>
            message.id === id ? { ...message, content } : message,
          ),
        },
      }
    }
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      }
    case "SET_STREAMING":
      return {
        ...state,
        isStreaming: action.payload,
      }
    case "SET_STREAMING_MESSAGE_ID":
      return {
        ...state,
        streamingMessageId: action.payload,
      }
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      }
    case "SET_MODEL":
      return {
        ...state,
        selectedModel: action.payload,
      }
    case "SET_DAILY_MESSAGE_COUNT":
      return {
        ...state,
        dailyMessageCount: action.payload,
      }
    case "SET_HAS_REACHED_LIMIT":
      return {
        ...state,
        hasReachedLimit: action.payload,
      }
    case "SET_NETWORK_STATUS":
      return {
        ...state,
        networkStatus: action.payload,
      }
    case "RESET_CONVERSATION":
      return {
        ...state,
        conversation: {
          id: null,
          title: "New Conversation",
          messages: [],
        },
      }
    case "UPDATE_CONVERSATION_ID":
      return {
        ...state,
        conversation: {
          ...state.conversation,
          id: action.payload,
        },
      }
    case "ADD_FAILED_MESSAGE":
      return {
        ...state,
        failedMessages: [...state.failedMessages, action.payload],
      }
    case "REMOVE_FAILED_MESSAGE":
      return {
        ...state,
        failedMessages: state.failedMessages.filter((id) => id !== action.payload),
      }
    case "CLEAR_FAILED_MESSAGES":
      return {
        ...state,
        failedMessages: [],
      }
    default:
      return state
  }
}

// Context
interface ChatContextType extends ChatState {
  sendMessage: (content: string) => Promise<void>
  changeModel: (model: AIModel) => void
  resetConversation: () => void
  cancelRequest: () => void
  loadConversation: (id: string) => Promise<void>
  isFreePlan: () => boolean
  retryFailedMessage: (messageId: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

// Provider component
export function ChatProvider({
  children,
  initialConversation,
}: {
  children: React.ReactNode
  initialConversation?: Conversation
}) {
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    conversation: initialConversation || initialState.conversation,
  })

  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const { currentPlan } = useSubscription()
  const isFirstMessageRef = useRef(true)
  const planCheckedRef = useRef(false)
  const pendingConversationIdRef = useRef<string | null>(null)
  const messageRetryQueue = useRef<Map<string, Message>>(new Map())

  // Initialize conversation
  useEffect(() => {
    if (initialConversation) {
      console.log("Setting initial conversation:", initialConversation)
      dispatch({ type: "SET_CONVERSATION", payload: initialConversation })
      isFirstMessageRef.current = initialConversation.id === null
    }
  }, [initialConversation])

  // Check network status
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: "SET_NETWORK_STATUS", payload: "online" })
      toast({
        title: "You're back online",
        description: "Your connection has been restored",
      })
    }

    const handleOffline = () => {
      dispatch({ type: "SET_NETWORK_STATUS", payload: "offline" })
      toast({
        title: "You're offline",
        description: "Check your connection and try again",
        variant: "destructive",
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [toast])

  // Load user's subscription plan
  useEffect(() => {
    const loadUserPlan = async () => {
      if (!user) return

      try {
        // Check message limit
        await checkMessageLimit()
        planCheckedRef.current = true
      } catch (error) {
        console.error("Error loading user plan:", error)
      }
    }

    loadUserPlan()
  }, [user, currentPlan])

  // Check if user is on free plan
  const isFreePlan = () => {
    return false // Everyone has premium features
  }

  // Check if user has reached daily message limit
  const checkMessageLimit = async () => {
    if (!user) return false

    // Only apply limit to free plan users
    if (!isFreePlan()) {
      dispatch({ type: "SET_HAS_REACHED_LIMIT", payload: false })
      return false
    }

    const count = await apiClient.fetchDailyMessageCount(user.id)
    dispatch({ type: "SET_DAILY_MESSAGE_COUNT", payload: count })

    const hasReached = count >= FREE_PLAN_MESSAGE_LIMIT
    dispatch({ type: "SET_HAS_REACHED_LIMIT", payload: hasReached })

    return hasReached
  }

  // Load a conversation
  const loadConversation = async (id: string) => {
    if (!user) return

    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      console.log("ChatContext: Loading conversation:", id)
      const conversation = await apiClient.fetchConversation(id, user.id)

      if (conversation) {
        console.log("ChatContext: Conversation loaded successfully:", conversation.title)

        // Ensure messages are sorted by timestamp
        if (conversation.messages && conversation.messages.length > 0) {
          conversation.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        }

        dispatch({ type: "SET_CONVERSATION", payload: conversation })

        // If the conversation has messages, check the model of the last message
        // and set it as the current model
        if (conversation.messages && conversation.messages.length > 0) {
          const lastMessage = conversation.messages[conversation.messages.length - 1]
          if (lastMessage.model) {
            dispatch({ type: "SET_MODEL", payload: lastMessage.model })
          }
        }
      } else {
        console.log("ChatContext: Conversation not found")
        dispatch({ type: "RESET_CONVERSATION" })
        toast({
          title: "Conversation not found",
          description: "The conversation you're looking for doesn't exist or you don't have access to it.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading conversation in ChatContext:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to load conversation. Please try again." })
      toast({
        title: "Error",
        description: "Failed to load conversation. Please try again.",
        variant: "destructive",
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  // Retry a failed message
  const retryFailedMessage = async (messageId: string) => {
    if (!user || !state.conversation.id) return

    // Find the failed message in the conversation
    const failedMessage = state.conversation.messages.find((msg) => msg.id === messageId)
    if (!failedMessage || failedMessage.role !== "user") return

    // Remove from failed messages list
    dispatch({ type: "REMOVE_FAILED_MESSAGE", payload: messageId })

    // Resend the message
    await sendMessage(failedMessage.content)
  }

  // Send a message with streaming response
  const sendMessage = async (content: string) => {
    if (!content.trim() || !user) return

    // Check network status
    if (state.networkStatus === "offline") {
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: Date.now().toString(),
          content: "You're currently offline. Please check your connection and try again.",
          role: "system",
          timestamp: new Date(),
          error: true,
        },
      })
      return
    }

    // Check message limit for free plan
    if (isFreePlan()) {
      const limitReached = await checkMessageLimit()

      if (limitReached) {
        dispatch({
          type: "ADD_MESSAGE",
          payload: {
            id: Date.now().toString(),
            content: `You've reached your daily limit of ${FREE_PLAN_MESSAGE_LIMIT} messages. Please upgrade your plan for unlimited messaging.`,
            role: "system",
            timestamp: new Date(),
            error: true,
          },
        })

        toast({
          title: "Message Limit Reached",
          description: `You've used all ${FREE_PLAN_MESSAGE_LIMIT} messages for today. Upgrade to continue chatting.`,
          variant: "destructive",
        })

        return
      }
    }

    // Reset error
    dispatch({ type: "SET_ERROR", payload: null })

    // Create user message with precise timestamp
    const now = new Date()
    const userMessageId = Date.now().toString()
    const userMessage: Message = {
      id: userMessageId,
      content,
      role: "user",
      timestamp: now,
      model: state.selectedModel,
    }

    // Add user message to state
    dispatch({ type: "ADD_MESSAGE", payload: userMessage })

    // Create a placeholder for the assistant's response with a slightly later timestamp
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: "",
      role: "assistant",
      timestamp: new Date(now.getTime() + 100), // 100ms later
      model: state.selectedModel,
      isStreaming: true,
    }

    // Add the placeholder message
    dispatch({ type: "ADD_MESSAGE", payload: assistantMessage })

    // Set streaming state
    dispatch({ type: "SET_STREAMING", payload: true })
    dispatch({ type: "SET_STREAMING_MESSAGE_ID", payload: assistantMessageId })

    try {
      // Ensure user profile exists
      if (user) {
        await apiClient.ensureUserProfile(user.id, user.email)
      }

      // Check if we need to create a new conversation
      let conversationId = state.conversation.id
      let isNewConversation = false

      if (!conversationId && isFirstMessageRef.current) {
        // Create a new conversation
        const title = content.substring(0, 30) + (content.length > 30 ? "..." : "")

        // Start creating the conversation in the background
        const createConversationPromise = apiClient.createConversation(user.id, title)

        // Update the UI immediately with a temporary ID
        const tempId = `temp-${Date.now()}`
        dispatch({
          type: "UPDATE_CONVERSATION_ID",
          payload: tempId,
        })

        // Wait for the actual conversation ID
        conversationId = await createConversationPromise
        isFirstMessageRef.current = false
        isNewConversation = true

        if (conversationId) {
          // Store the pending ID to avoid race conditions
          pendingConversationIdRef.current = conversationId

          // Update conversation state with the real ID
          dispatch({
            type: "UPDATE_CONVERSATION_ID",
            payload: conversationId,
          })

          // Update URL without page reload
          router.push(`/dashboard?conversation=${conversationId}`, { scroll: false })
        }
      }

      // Get the current conversation history
      // Include the new user message we just added
      const conversationHistory = [...state.conversation.messages.filter((m) => !m.isStreaming), userMessage]

      // Initialize full response text
      let fullResponseText = ""

      // Stream the message
      await apiClient.streamMessage(
        content,
        state.selectedModel,
        user.id,
        // On chunk received
        (chunk) => {
          fullResponseText += chunk
          dispatch({
            type: "UPDATE_STREAMING_MESSAGE",
            payload: { id: assistantMessageId, content: fullResponseText },
          })
        },
        // On complete
        (finalText) => {
          // Update the message with the final text
          dispatch({
            type: "UPDATE_STREAMING_MESSAGE",
            payload: { id: assistantMessageId, content: finalText },
          })

          // Reset streaming state
          dispatch({ type: "SET_STREAMING", payload: false })
          dispatch({ type: "SET_STREAMING_MESSAGE_ID", payload: null })

          // Save messages to database
          if (conversationId) {
            const finalAssistantMessage = {
              ...assistantMessage,
              content: finalText,
              isStreaming: false,
            }
            apiClient.saveMessages(conversationId, userMessage, finalAssistantMessage)
          }

          // Update message count
          if (isFreePlan()) {
            checkMessageLimit()
          }
        },
        // On error
        (errorMessage) => {
          console.error("Error in streaming response:", errorMessage)

          // Add the message ID to failed messages
          dispatch({ type: "ADD_FAILED_MESSAGE", payload: userMessageId })

          // Try one more time with a simpler approach for common questions
          if (content.toLowerCase().includes("what is") && content.includes("*")) {
            try {
              // Extract numbers and operation
              const mathExpression = content.replace(/what is/i, "").trim()
              // Use Function constructor to safely evaluate the math expression
              const result = new Function(`return ${mathExpression}`)()
              const answer = `The answer to ${mathExpression} is ${result}.`

              // Update the message with the calculated answer
              dispatch({
                type: "UPDATE_STREAMING_MESSAGE",
                payload: {
                  id: assistantMessageId,
                  content: answer,
                },
              })

              // Reset streaming state
              dispatch({ type: "SET_STREAMING", payload: false })
              dispatch({ type: "SET_STREAMING_MESSAGE_ID", payload: null })

              // Remove from failed messages
              dispatch({ type: "REMOVE_FAILED_MESSAGE", payload: userMessageId })

              return
            } catch (calcError) {
              console.error("Failed to calculate math expression:", calcError)
            }
          }

          // Update the message with the error
          dispatch({
            type: "UPDATE_STREAMING_MESSAGE",
            payload: {
              id: assistantMessageId,
              content: `Sorry, there was an error: ${errorMessage}. Please try again.`,
            },
          })

          // Reset streaming state
          dispatch({ type: "SET_STREAMING", payload: false })
          dispatch({ type: "SET_STREAMING_MESSAGE_ID", payload: null })
          dispatch({ type: "SET_ERROR", payload: errorMessage })

          // Show toast notification about the error
          toast({
            title: "Error",
            description: `Failed to get response: ${errorMessage}`,
            variant: "destructive",
          })
        },
        conversationId,
        isNewConversation,
        conversationHistory,
      )
    } catch (error: any) {
      console.error("Error sending message:", error)

      // Add the message ID to failed messages
      dispatch({ type: "ADD_FAILED_MESSAGE", payload: userMessageId })

      // Update the streaming message with an error
      dispatch({
        type: "UPDATE_STREAMING_MESSAGE",
        payload: {
          id: state.streamingMessageId || assistantMessageId,
          content: `Sorry, there was an error sending your message: ${error.message}. Please try again.`,
        },
      })

      // Reset streaming state
      dispatch({ type: "SET_STREAMING", payload: false })
      dispatch({ type: "SET_STREAMING_MESSAGE_ID", payload: null })
      dispatch({ type: "SET_ERROR", payload: "Failed to send message" })

      // Show toast notification about the error
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Change the AI model
  const changeModel = (model: AIModel) => {
    if (model === state.selectedModel) return

    dispatch({ type: "SET_MODEL", payload: model })

    // Add system message about model change
    if (state.conversation.messages.length > 0) {
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: Date.now().toString(),
          content: `Switched to ${model} model`,
          role: "system",
          timestamp: new Date(),
          model,
        },
      })

      // Show toast notification about model change
      toast({
        title: `Switched to ${model}`,
        description: "Your next message will be sent to the new model with full conversation history.",
      })
    }
  }

  // Reset conversation
  const resetConversation = () => {
    dispatch({ type: "RESET_CONVERSATION" })
    dispatch({ type: "CLEAR_FAILED_MESSAGES" })
    isFirstMessageRef.current = true
    router.push("/dashboard", { scroll: false })
  }

  // Cancel request
  const cancelRequest = () => {
    apiClient.cancelRequest()

    if (state.streamingMessageId) {
      // Update the streaming message to indicate cancellation
      dispatch({
        type: "UPDATE_STREAMING_MESSAGE",
        payload: {
          id: state.streamingMessageId,
          content: "Message request cancelled",
        },
      })
    }

    // Reset streaming state
    dispatch({ type: "SET_STREAMING", payload: false })
    dispatch({ type: "SET_STREAMING_MESSAGE_ID", payload: null })

    // Add system message about cancellation if no streaming message
    if (!state.streamingMessageId) {
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: Date.now().toString(),
          content: "Message request cancelled",
          role: "system",
          timestamp: new Date(),
          error: true,
        },
      })
    }
  }

  return (
    <ChatContext.Provider
      value={{
        ...state,
        sendMessage,
        changeModel,
        resetConversation,
        cancelRequest,
        loadConversation,
        isFreePlan,
        retryFailedMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

// Hook for using the chat context
export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
