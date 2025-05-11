"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
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
  File,
  User,
  Trash2,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageFormatter } from "./message-formatter"
import { useRouter, useSearchParams } from "next/navigation"
import { ErrorBoundary } from "./error-boundary"
import { useChat } from "@/contexts/chat-context"
import { RetryButton } from "./retry-button"
import { EmojiPicker } from "./emoji-picker"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { useSubscription } from "@/components/subscription-provider"
import { useLanguage } from "@/contexts/language-context"
import { apiClient } from "@/utils/api-client"

// Add this to the top of your chat-interface.tsx file
// This will ensure the styles are applied to the chat messages

import "./message-styles.css"

// Add this CSS style constant at the top of the file, after the imports and before the component definitions

const forcedBackgroundStyles = `
.flex.flex-col.md\\:flex-row.items-center.rounded-lg.border.border-\\[\\#1a1a1a\\].bg-\\[\\#1a1a1a\\].px-4.py-2.w-full.max-w-3xl.mx-auto, 
.flex.flex-col.md\\:flex-row.items-center.rounded-lg.border.border-\\[\\#1a1a1a\\].bg-\\[\\#1a1a1a\\].px-4.py-2.w-full.max-w-3xl.mx-auto * {
   background: #1a1a1a !important;
}

.rtl-text-support {
  direction: rtl;
  text-align: right;
}

.rtl-text-support::placeholder {
  text-align: right;
}

/* Flip send icon for RTL */
html[dir="rtl"] .send-icon {
  transform: scaleX(-1);
}

/* Center text in New Chat button */
.new-chat-button {
  justify-content: center !important;
}
.new-chat-button svg {
  position: absolute;
  left: 12px;
}
html[dir="rtl"] .new-chat-button svg {
  left: auto;
  right: 12px;
}
`

const suggestionTitleStyles = `
.suggestion-title {
 font-size: 1.2vw !important;
 font-weight: bold;
 background: linear-gradient(to right, #3D9BFC, #5F53EB, #70B4AF);
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
 background-clip: text;
 white-space: normal;
 width: 100%;
}

.suggestion-card {
 width: auto !important;
 min-width: auto !important;
 padding: 10px 15px !important;
}
`

// User Avatar component
export function UserAvatar() {
  return (
    <div className="h-8 w-8 rounded-md overflow-hidden bg-[#0f0f10] border border-[#333333] flex items-center justify-center">
      <User className="h-5 w-5 text-gray-400" />
    </div>
  )
}

// Message display component with error handling
function MessageDisplay({ message }: { message: any }) {
  const { isLoading, retryFailedMessage } = useChat()
  const isStreaming = message.isStreaming
  const isFailed = message.error
  const { t, language } = useLanguage()

  // Translate placeholder messages based on the current language
  const translatePlaceholderMessage = (content: string) => {
    if (!content) return content

    // Define placeholder messages in English
    const placeholderMessages = {
      "No response content": "placeholder.noResponseContent",
      "I'm thinking about this...": "placeholder.thinking",
      "Working on your question...": "placeholder.working",
      "Processing your request...": "placeholder.processing",
      "Let me analyze that...": "placeholder.analyzing",
    }

    // Check if the content is one of the placeholder messages
    for (const [english, translationKey] of Object.entries(placeholderMessages)) {
      if (content === english || content.includes(english)) {
        return content.replace(english, t(translationKey))
      }
    }

    return content
  }

  // Translate the message content if it's a placeholder message
  const translatedContent = translatePlaceholderMessage(message.content || "")

  return (
    <div
      className={`flex w-full ${
        message.role === "user" ? "justify-end" : message.role === "system" ? "justify-center" : ""
      }`}
    >
      {message.role === "system" ? (
        <div
          className={`rounded-lg bg-[#1a1a1a] p-3 text-xs message-bubble ${message.error ? "text-red-400" : "text-gray-400"}`}
        >
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
        <div className="flex w-full justify-end">
          <div
            className="break-words rounded-lg bg-[#1a1a1a] text-white message-bubble"
            style={{ padding: "12px 15px" }}
          >
            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
            {message.files && message.files.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.files.map((file: File, index: number) => (
                  <div key={index} className="flex items-center rounded bg-[#333] px-2 py-1 text-xs">
                    <File className="mr-1 h-3 w-3" />
                    <span className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</span>
                  </div>
                ))}
              </div>
            )}
            {isFailed && <RetryButton messageId={message.id} />}
          </div>
        </div>
      ) : (
        <div className="w-full break-words text-white">
          <ErrorBoundary>
            <MessageFormatter content={translatedContent} />
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
                  {t("chat.retry")}
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

// Chat messages component
function ChatMessages() {
  const { messages, isLoading, currentConversationId } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [shouldHighlight, setShouldHighlight] = useState(false)
  const [hasMessages, setHasMessages] = useState(false)
  const [hasConversationId, setHasConversationId] = useState(false)
  const { t } = useLanguage()

  // Update hasMessages when messages changes
  useEffect(() => {
    setHasMessages(messages.length > 0)
    setHasConversationId(!!currentConversationId)
  }, [messages.length, currentConversationId, messages])

  // Scroll to bottom when messages change or during streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Highlight code blocks
  useEffect(() => {
    setShouldHighlight(true)
  }, [messages])

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

  // Don't show the "empty conversation" message if we have messages
  if (hasMessages) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-col space-y-4">
          {messages.map((message) => (
            <ErrorBoundary key={message.id}>
              <MessageDisplay message={message} />
            </ErrorBoundary>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    )
  }

  // When we have a conversation ID but no messages, just show an empty space
  if (hasConversationId && !hasMessages) {
    return <div className="flex-1"></div>
  }

  // Default case - no messages, no conversation ID
  return <Suggestions />
}

// Loading indicator component
function LoadingIndicator() {
  const { t } = useLanguage()

  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-4 text-sm text-gray-400">{t("chat.loading")}</p>
      </div>
    </div>
  )
}

// CSS for auto-scrolling animation
const autoScrollStyles = `
@keyframes scroll {
 0% {
   transform: translateX(0);
 }
 100% {
   transform: translateX(-50%);
 }
}

@keyframes scroll-rtl {
 0% {
   transform: translateX(0);
 }
 100% {
   transform: translateX(-50%);
 }
}

.auto-scroll {
 animation: scroll 180s linear infinite;
 will-change: transform;
}

/* Force LTR direction for suggestions in both LTR and RTL modes */
.suggestion-wrapper {
 direction: ltr !important;
}

.auto-scroll:hover {
 animation-play-state: paused;
}

/* Hide scrollbars */
.suggestion-wrapper {
 overflow: hidden !important;
 position: relative;
}

.suggestion-wrapper::-webkit-scrollbar {
 display: none !important;
}

/* Mask image for fading effect */
.suggestion-wrapper::before,
.suggestion-wrapper::after {
 content: "";
 position: absolute;
 z-index: 3;
 top: 0;
 bottom: 0;
 width: 5rem;
 pointer-events: none;
}

.suggestion-wrapper::before {
 left: 0;
 background: linear-gradient(to right, rgba(20, 20, 20, 1), rgba(20, 20, 20, 0));
}

.suggestion-wrapper::after {
 right: 0;
 background: linear-gradient(to left, rgba(20, 20, 20, 1), rgba(20, 20, 20, 0));
}

/* Ensure cards don't disappear on hover */
.suggestion-card {
 transition: background-color 0.2s ease;
 z-index: 2;
 position: relative;
}

.suggestion-card:hover {
 background-color: #252525;
 z-index: 4; /* Higher than the mask */
}

/* Ensure the content inside cards is always visible */
.suggestion-card * {
 position: relative;
 z-index: 2;
}
`

// Suggestions component
function Suggestions() {
  const { sendMessage } = useChat()
  const suggestionsContainerRef = useRef<HTMLDivElement>(null)
  const { t, dir } = useLanguage()

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  // Original suggestions with proper translation keys
  const suggestions = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: t("suggestions.blogPost"),
      description: t("suggestions.blogPostDesc"),
      prompt: "Write a blog post about AI trends in 2025",
    },
    {
      icon: <Code className="h-5 w-5" />,
      title: t("suggestions.codeHelp"),
      description: t("suggestions.codeHelpDesc"),
      prompt: "Help me debug this JavaScript code",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: t("suggestions.draftMessage"),
      description: t("suggestions.draftMessageDesc"),
      prompt: "Draft a professional response to a client complaint",
    },
    {
      icon: <Lightbulb className="h-5 w-5" />,
      title: t("suggestions.generateIdeas"),
      description: t("suggestions.generateIdeasDesc"),
      prompt: "Generate ideas for my next social media campaign",
    },
    {
      icon: <FileSearch className="h-5 w-5" />,
      title: t("suggestions.coldEmail"),
      description: t("suggestions.coldEmailDesc"),
      prompt: "Help me write a cold email for potential clients",
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: t("suggestions.newsletter"),
      description: t("suggestions.newsletterDesc"),
      prompt: "Write a newsletter about latest industry trends",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: t("suggestions.summarize"),
      description: t("suggestions.summarizeDesc"),
      prompt: "Summarize this text",
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: t("suggestions.studyVocabulary"),
      description: t("suggestions.studyVocabularyDesc"),
      prompt: "Create vocabulary cards for this topic",
    },
    {
      icon: <Lightbulb className="h-5 w-5" />,
      title: t("suggestions.workoutPlan"),
      description: t("suggestions.workoutPlanDesc"),
      prompt: "Create a workout plan for me",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: t("suggestions.translate"),
      description: t("suggestions.translateDesc"),
      prompt: "Translate this text",
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: t("suggestions.analyzeBook"),
      description: t("suggestions.analyzeBookDesc"),
      prompt: "Analyze this book content",
    },
    {
      icon: <Code className="h-5 w-5" />,
      title: t("suggestions.learnCoding"),
      description: t("suggestions.learnCodingDesc"),
      prompt: "How can I learn coding?",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: t("suggestions.createMenu"),
      description: t("suggestions.createMenuDesc"),
      prompt: "Create a 4 course menu",
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: t("suggestions.writeStory"),
      description: t("suggestions.writeStoryDesc"),
      prompt: "Help me write a story",
    },
  ]

  // Duplicate the suggestions for seamless scrolling
  const allSuggestions = [...suggestions, ...suggestions]

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <style>{autoScrollStyles}</style>
      <style>{suggestionTitleStyles}</style>
      <h3 className="mb-2 text-lg text-gray-400">{t("chat.aiInOnePlaceTitle")}</h3>
      <h1 className="mb-8 text-4xl font-bold text-white">{t("chat.askMeAnything")}</h1>

      {/* Auto-scrolling suggestions for both mobile and desktop */}
      <div className="w-full max-w-full pb-4 suggestion-wrapper" ref={suggestionsContainerRef}>
        <div className="auto-scroll flex gap-2 px-4" style={{ width: "fit-content" }}>
          {allSuggestions.map((suggestion, index) => (
            <SuggestionCard
              key={index}
              icon={suggestion.icon}
              title={suggestion.title}
              description={suggestion.description}
              onClick={() => handleSuggestionClick(suggestion.prompt)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  created_at?: string
}

interface ChatInterfaceProps {
  conversationId: string | null
  onConversationCreated?: (id: string, title: string) => void
  initialMessages?: Message[]
  initialTitle?: string
}

export function ChatInterfaceComponent({
  conversationId,
  onConversationCreated,
  initialMessages = [],
  initialTitle = "New Conversation",
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const { currentPlan, isLoading: isLoadingSubscription } = useSubscription()
  const { t, dir } = useLanguage()

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Reset state when conversation changes
  useEffect(() => {
    setMessages(initialMessages)
    setInput("")
    setIsLoading(false)
    setIsCopied(false)
    setIsClearing(false)
    setIsRetrying(false)
  }, [conversationId, initialMessages])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    // Add user message to state
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Send message to API
      const response = await apiClient.sendMessage(
        input,
        conversationId,
        messages,
        user?.id || "anonymous",
        initialTitle,
      )

      if (!response) {
        throw new Error("Failed to send message")
      }

      // Update conversation ID if this is a new conversation
      if (!conversationId && response.conversationId && onConversationCreated) {
        onConversationCreated(response.conversationId, response.title || initialTitle)
      }

      // Add assistant message to state
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: response.message,
        },
      ])
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle clearing the conversation
  const handleClearConversation = async () => {
    if (!conversationId || isClearing) return

    setIsClearing(true)

    try {
      const success = await apiClient.clearConversation(conversationId, user?.id || "anonymous")

      if (success) {
        setMessages([])
        toast({
          title: "Conversation cleared",
          description: "All messages have been removed from this conversation.",
        })
      } else {
        throw new Error("Failed to clear conversation")
      }
    } catch (error) {
      console.error("Error clearing conversation:", error)
      toast({
        title: "Error",
        description: "Failed to clear conversation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsClearing(false)
    }
  }

  // Handle retrying the last message
  const handleRetry = async () => {
    if (messages.length === 0 || isRetrying) return

    // Find the last user message
    const lastUserMessageIndex = [...messages].reverse().findIndex((msg) => msg.role === "user")
    if (lastUserMessageIndex === -1) return

    const lastUserMessage = messages[messages.length - 1 - lastUserMessageIndex]
    setIsRetrying(true)

    // Remove all messages after the last user message
    const messagesToKeep = messages.slice(0, messages.length - lastUserMessageIndex)
    setMessages(messagesToKeep)

    try {
      // Send the last user message again
      const response = await apiClient.sendMessage(
        lastUserMessage.content,
        conversationId,
        messagesToKeep,
        user?.id || "anonymous",
        initialTitle,
      )

      if (!response) {
        throw new Error("Failed to retry message")
      }

      // Add assistant message to state
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: response.message,
        },
      ])
    } catch (error) {
      console.error("Error retrying message:", error)
      toast({
        title: "Error",
        description: "Failed to retry message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRetrying(false)
    }
  }

  // Handle copying the last message
  const handleCopy = () => {
    if (messages.length === 0) return

    const lastMessage = messages[messages.length - 1]
    navigator.clipboard.writeText(lastMessage.content)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    toast({
      title: "Copied to clipboard",
      description: "The last message has been copied to your clipboard.",
    })
  }

  // Check if user has reached message limit
  const hasReachedMessageLimit = () => {
    if (!currentPlan || isLoadingSubscription) return false

    // Free users can send up to 20 messages per day
    if (currentPlan.name === "Free") {
      // This is a simplified check. In a real app, you'd track daily message count in the database.
      return false
    }

    return false
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold">{t("chat.welcome")}</h2>
              <p className="text-gray-500 mt-2">{t("chat.startPrompt")}</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} items-start gap-2`}
            >
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-[#1a1a1a] text-white rounded-tl-none"
                }`}
              >
                <MessageFormatter content={message.content} />
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Action buttons */}
      {messages.length > 0 && (
        <div className="flex justify-center gap-2 p-2 border-t border-[#333]">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearConversation}
            disabled={isClearing || !conversationId}
            className="text-xs"
          >
            {isClearing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3 mr-1" />}
            {t("chat.clear")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={isRetrying || messages.length === 0}
            className="text-xs"
          >
            {isRetrying ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3 mr-1" />}
            {t("chat.retry")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={messages.length === 0} className="text-xs">
            {isCopied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            {t("chat.copy")}
          </Button>
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t border-[#333] p-4 no-rtl-flip" dir="ltr">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("chat.typeMessage")}
          className="min-h-[60px] flex-1 resize-none bg-[#1a1a1a] border-[#333] focus-visible:ring-0 focus-visible:ring-offset-0"
          style={{
            direction: dir === "rtl" ? "rtl" : "ltr",
            textAlign: dir === "rtl" ? "right" : "left",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
          disabled={isLoading || hasReachedMessageLimit()}
        />
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading || hasReachedMessageLimit()}
            className="h-[60px] w-[60px] rounded-md bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>

        {/* Subscription upsell for free users */}
        {currentPlan?.name === "Free" && !isLoadingSubscription && (
          <div className="mt-2 text-center text-xs text-gray-500">
            <span>{t("chat.freeLimit")}</span>{" "}
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-blue-500"
              onClick={() => (window.location.href = "/subscription")}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {t("chat.upgrade")}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}

// Chat input component
function ChatInput() {
  const {
    sendMessage,
    isLoading,
    selectedModel,
    setSelectedModel,
    hasReachedDailyLimit,
    dailyMessageCount,
    maxDailyMessages,
    currentConversationId,
  } = useChat()
  const [inputValue, setInputValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [networkStatus, setNetworkStatus] = useState<"online" | "offline">("online")
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get("conversation")
  const { t, dir } = useLanguage()

  // Check network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus("online")
    const handleOffline = () => setNetworkStatus("offline")

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Function to handle sending messages
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() && selectedFiles.length === 0) return

      setIsSubmitting(true)

      try {
        // Send the message with files
        await sendMessage(content.trim(), selectedFiles.length > 0 ? [...selectedFiles] : undefined)
        // Clear selected files after sending
        setSelectedFiles([])
      } finally {
        // Clear input immediately for better UX
        setInputValue("")
        setIsSubmitting(false)
      }
    },
    [sendMessage, selectedFiles],
  )

  const handleSend = () => {
    if (inputValue.trim() || selectedFiles.length > 0) {
      handleSendMessage(inputValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setSelectedFiles((prev) => [...prev, ...filesArray])
      // Reset the file input so the same file can be selected again
      e.target.value = ""
    }
  }

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleEmojiSelect = (emoji: string) => {
    setInputValue((prev) => prev + emoji)
    setShowEmojiPicker(false)
    // Focus the input after selecting an emoji
    inputRef.current?.focus()
  }

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close emoji picker when clicking outside
  useEffect(() => {
    if (!showEmojiPicker) return

    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && event.target instanceof Node && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showEmojiPicker])

  // Disable input during loading or streaming
  const isInputDisabled = isLoading || hasReachedDailyLimit || networkStatus === "offline"

  // Input field section
  const inputSection = (
    <Input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={hasReachedDailyLimit ? t("chat.upgradeToSendMore") : t("chat.askFollowUp")}
      className="min-w-[150px] w-full md:flex-1 border-0 bg-[#1a1a1a] text-sm text-white shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-left"
      style={{
        background: "#1a1a1a !important",
        direction: dir === "rtl" ? "rtl" : "ltr",
        textAlign: dir === "rtl" ? "right" : "left",
      }}
      disabled={isInputDisabled}
    />
  )

  // Controls section - paperclip, emoji, model selector, send button
  const controlsSection = (
    <div className="flex flex-shrink-0 items-center gap-2 w-full md:w-auto justify-between md:justify-end mt-2 md:mt-0">
      <div className="flex items-center gap-2">
        <button
          onClick={handleSend}
          disabled={(!inputValue.trim() && selectedFiles.length === 0) || isSubmitting || isInputDisabled}
          className={`rounded p-2 transition-colors duration-200 hover:bg-[#333] hover:text-white ${
            (!inputValue.trim() && selectedFiles.length === 0) || isSubmitting || isInputDisabled ? "opacity-50" : ""
          }`}
          style={{ background: "#1a1a1a !important" }}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : (
            <Send className="h-5 w-5 send-icon text-gray-400" />
          )}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="z-50">
            <button
              type="button"
              className={`flex items-center gap-1 rounded px-2 py-1 text-sm transition-colors duration-200 hover:bg-[#333] focus:outline-none ${
                isInputDisabled ? "opacity-50" : ""
              }`}
              style={{ background: "#1a1a1a !important" }}
            >
              {dir === "rtl" ? (
                <>
                  <ChevronDown className={`h-4 w-4 ${isInputDisabled ? "text-gray-600" : "text-gray-400"}`} />
                  <span className={selectedModel === "ChatGPT" ? "text-green-400" : "text-blue-400"}>
                    {selectedModel}
                  </span>
                </>
              ) : (
                <>
                  <span className={selectedModel === "ChatGPT" ? "text-green-400" : "text-blue-400"}>
                    {selectedModel}
                  </span>
                  <ChevronDown className={`h-4 w-4 ${isInputDisabled ? "text-gray-600" : "text-gray-400"}`} />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            sideOffset={5}
            align="end"
            className="z-[100] min-w-[8rem] bg-[#1a1a1a] text-white border border-[#333]"
            style={{ background: "#1a1a1a !important" }}
          >
            <DropdownMenuItem
              onSelect={() => setSelectedModel("ChatGPT")}
              className={`cursor-pointer ${
                selectedModel === "ChatGPT" ? "bg-[#1a1a1a]/40 text-green-400" : ""
              } hover:bg-[#333] focus:bg-[#333]`}
              style={{ background: "#1a1a1a !important" }}
            >
              ChatGPT
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setSelectedModel("Gemini")}
              className={`cursor-pointer ${
                selectedModel === "Gemini" ? "bg-[#1a1a1a]/40 text-blue-400" : ""
              } hover:bg-[#333] focus:bg-[#333]`}
              style={{ background: "#1a1a1a !important" }}
            >
              Gemini
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="rounded p-2 transition-colors duration-200 hover:bg-[#333] hover:text-white"
          disabled={isInputDisabled}
          onClick={handleFileButtonClick}
          style={{ background: "#1a1a1a !important" }}
        >
          <Paperclip className={`h-5 w-5 ${isInputDisabled ? "text-gray-600" : "text-gray-400"}`} />
        </button>
        <div className="relative" ref={emojiPickerRef}>
          <button
            className="rounded p-2 transition-colors duration-200 hover:bg-[#333] hover:text-white"
            disabled={isInputDisabled}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={{ background: "#1a1a1a !important" }}
          >
            <SmilePlus className={`h-5 w-5 ${isInputDisabled ? "text-gray-600" : "text-gray-400"}`} />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 z-50">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-4 flex flex-col items-center">
      <style>{forcedBackgroundStyles}</style>
      {hasReachedDailyLimit && (
        <div className="mb-2 flex items-center justify-between rounded-md bg-[#1a1a1a] px-3 py-2 text-xs w-full max-w-3xl mx-auto">
          <div className="flex items-center">
            <Lock className={`${dir === "rtl" ? "ml-1.5" : "mr-1.5"} h-3.5 w-3.5 text-gray-400`} />
            <span className="text-gray-300">
              {t("chat.dailyLimitReached", { count: dailyMessageCount, max: maxDailyMessages })}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-6 bg-gray-700 px-2 py-0 text-xs text-gray-200 hover:bg-gray-600"
            onClick={() => router.push("/subscription")}
          >
            {t("chat.upgrade")}
          </Button>
        </div>
      )}

      {/* Hidden file input */}
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple />

      {/* Selected files display */}
      {selectedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 w-full max-w-3xl mx-auto">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center rounded bg-[#1a1a1a] px-2 py-1 text-xs text-white">
              <File className={`${dir === "rtl" ? "ml-1" : "mr-1"} h-3 w-3`} />
              <span className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className={`${dir === "rtl" ? "mr-1" : "ml-1"} rounded-full p-1 hover:bg-[#333]`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        ref={inputContainerRef}
        className="flex flex-col md:flex-row items-center rounded-lg border border-[#1a1a1a] bg-[#1a1a1a] px-4 py-2 w-full max-w-3xl mx-auto message-bubble"
        style={{ background: "#1a1a1a !important" }}
        dir="ltr" // Always LTR for input
      >
        {/* Conditionally render based on language direction and screen size */}
        {dir === "rtl" ? (
          <>
            {/* For Arabic: Mobile - Input first, controls last */}
            <div className="flex flex-col w-full md:hidden">
              {inputSection}
              {controlsSection}
            </div>

            {/* For Arabic: Desktop - Controls first, input last */}
            <div className="hidden md:flex md:flex-row w-full">
              {controlsSection}
              {inputSection}
            </div>
          </>
        ) : (
          // For English: Original layout exactly as provided
          <>
            {inputSection}
            <div className="flex flex-shrink-0 items-center gap-2 w-full md:w-auto justify-between md:justify-end mt-2 md:mt-0">
              <div className="flex items-center gap-2">
                <button
                  className="rounded p-2 transition-colors duration-200 hover:bg-[#333] hover:text-white"
                  disabled={isInputDisabled}
                  onClick={handleFileButtonClick}
                  style={{ background: "#1a1a1a !important" }}
                >
                  <Paperclip className={`h-5 w-5 ${isInputDisabled ? "text-gray-600" : "text-gray-400"}`} />
                </button>
                <div className="relative" ref={emojiPickerRef}>
                  <button
                    className="rounded p-2 transition-colors duration-200 hover:bg-[#333] hover:text-white"
                    disabled={isInputDisabled}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    style={{ background: "#1a1a1a !important" }}
                  >
                    <SmilePlus className={`h-5 w-5 ${isInputDisabled ? "text-gray-600" : "text-gray-400"}`} />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-2 z-50">
                      <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="z-50">
                    <button
                      type="button"
                      className={`flex items-center gap-1 rounded px-2 py-1 text-sm transition-colors duration-200 hover:bg-[#333] focus:outline-none ${
                        isInputDisabled ? "opacity-50" : ""
                      }`}
                      style={{ background: "#1a1a1a !important" }}
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
                    className="z-[100] min-w-[8rem] bg-[#1a1a1a] text-white border border-[#333]"
                    style={{ background: "#1a1a1a !important" }}
                  >
                    <DropdownMenuItem
                      onSelect={() => setSelectedModel("ChatGPT")}
                      className={`cursor-pointer ${
                        selectedModel === "ChatGPT" ? "bg-[#1a1a1a]/40 text-green-400" : ""
                      } hover:bg-[#333] focus:bg-[#333]`}
                      style={{ background: "#1a1a1a !important" }}
                    >
                      ChatGPT
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setSelectedModel("Gemini")}
                      className={`cursor-pointer ${
                        selectedModel === "Gemini" ? "bg-[#1a1a1a]/40 text-blue-400" : ""
                      } hover:bg-[#333] focus:bg-[#333]`}
                      style={{ background: "#1a1a1a !important" }}
                    >
                      Gemini
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  onClick={handleSend}
                  disabled={(!inputValue.trim() && selectedFiles.length === 0) || isSubmitting || isInputDisabled}
                  className={`rounded p-2 transition-colors duration-200 hover:bg-[#333] hover:text-white ${
                    (!inputValue.trim() && selectedFiles.length === 0) || isSubmitting || isInputDisabled
                      ? "opacity-50"
                      : ""
                  }`}
                  style={{ background: "#1a1a1a !important" }}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  ) : (
                    <Send className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="mt-2 text-center text-xs text-gray-500 w-full max-w-3xl mx-auto">{t("chat.disclaimer")}</div>
    </div>
  )
}

// Network status alert
function NetworkAlert() {
  const [networkStatus, setNetworkStatus] = useState<"online" | "offline">("online")
  const { t } = useLanguage()

  useEffect(() => {
    const handleOnline = () => setNetworkStatus("online")
    const handleOffline = () => setNetworkStatus("offline")

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (networkStatus === "online") return null

  return (
    <div className="bg-yellow-900/20 border border-yellow-800 m-4 p-3 rounded-md bg-[#1a1a1a]">
      <div className="flex items-center">
        <AlertCircle className="h-4 w-4 text-yellow-400 mr-2" />
        <span className="text-yellow-300 text-sm">{t("chat.offlineWarning")}</span>
      </div>
    </div>
  )
}

// Error alert
function ErrorAlert() {
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const { loadConversation, currentConversationId } = useChat()
  const { t } = useLanguage()

  useEffect(() => {
    const handleError = (e: CustomEvent) => {
      setError(e.detail.message || "Something went wrong")
    }

    window.addEventListener("chat-error" as any, handleError)
    return () => {
      window.removeEventListener("chat-error", handleError)
    }
  }, [])

  if (!error) return null

  const handleRetry = async () => {
    setIsRetrying(true)
    if (currentConversationId) {
      await loadConversation(currentConversationId)
    }
    setError(null)
    setIsRetrying(false)
  }

  return (
    <div className="bg-red-900/20 border border-red-800 m-4 p-3 rounded-md bg-[#1a1a1a]">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
          <span className="text-red-300 text-sm">{error || t("chat.somethingWentWrong")}</span>
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
              {t("chat.retrying")}
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              {t("chat.retry")}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Main chat interface component
export function ChatInterface({
  conversationId,
  conversationTitle,
  onConversationTitleChange,
}: {
  conversationId?: string | null
  conversationTitle?: string
  onConversationTitleChange?: (title: string) => void
} = {}) {
  // The ChatInterfaceInner component is already wrapped by ChatProvider in the parent components
  return <ChatInterfaceInner />
}

// Inner chat interface component (uses context)
function ChatInterfaceInner() {
  const { messages, currentConversationId, loadConversation } = useChat()
  const [renderKey, setRenderKey] = useState(0)
  const [hasMounted, setHasMounted] = useState(false)
  const searchParams = useSearchParams()
  const conversationIdFromUrl = searchParams?.get("conversation")
  const loadAttemptedRef = useRef<{ id: string | null }>({ id: null })

  useEffect(() => {
    setHasMounted(true)
  }, [])

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

  // Load conversation from URL if needed
  useEffect(() => {
    if (hasMounted && conversationIdFromUrl) {
      // Check if this is a different conversation than what we're currently viewing
      // or what we've already attempted to load
      if (conversationIdFromUrl !== currentConversationId || conversationIdFromUrl !== loadAttemptedRef.current.id) {
        // Update the ref to track which conversation we're loading
        loadAttemptedRef.current.id = conversationIdFromUrl

        console.log("Loading conversation from URL:", conversationIdFromUrl)
        loadConversation(conversationIdFromUrl).catch((err) => {
          console.error("Failed to load conversation:", err)
        })
      }
    }
  }, [hasMounted, conversationIdFromUrl, currentConversationId, loadConversation])

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
      className="suggestion-card flex h-auto items-center justify-center md:items-start md:justify-start gap-2 border-0 bg-[#1e1e1e] text-center md:text-left transition-all duration-200 hover:bg-[#252525] shrink-0 md:gap-4"
      onClick={onClick}
    >
      <div className="hidden md:block mt-1 bg-gradient-to-r from-[#3D9BFC] via-[#5F53EB] to-[#70B4AF] bg-clip-text text-transparent">
        {icon}
      </div>
      <div className="w-full">
        <h3 className="suggestion-title">{title}</h3>
        <p className="mt-1 text-sm text-gray-400 hidden md:block">{description}</p>
      </div>
    </Button>
  )
}
