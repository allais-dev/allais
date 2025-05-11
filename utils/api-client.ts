import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Model types
export type AIModel = "ChatGPT" | "Gemini"

// Message types
export type MessageRole = "user" | "assistant" | "system"

export interface Message {
  id: string
  content: string
  role: MessageRole
  timestamp: Date
  model?: AIModel
  error?: boolean
  isStreaming?: boolean
  files?: File[]
  userId?: string // Add userId to the Message interface
}

export interface Conversation {
  id: string | null
  title: string
  messages: Message[]
}

// API response types
export interface AIResponse {
  text: string
  model: AIModel
  error?: string
}

// Constants for webhook URLs
const WEBHOOK_URLS = {
  ChatGPT: "https://n8nttl.allais.space/webhook/203c81fe-6cfa-4514-a11f-e7bd87abac09",
  Gemini: "https://n8nttl.allais.space/webhook/0faec6f6-d7eb-466d-b3e1-1c184c447e3a",
}

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 30000

// Maximum number of retries for API requests
const MAX_RETRIES = 3

// Maximum number of messages to include in conversation history
const MAX_HISTORY_MESSAGES = 10

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Special user ID for anonymous users
const ANONYMOUS_USER_ID = "efcfb65f-cc62-431b-a1ee-2cca90618d39"

// Define placeholder messages for each language
const PLACEHOLDER_MESSAGES = {
  en: {
    thinking: "I'm thinking about this...",
    working: "Working on your question...",
    processing: "Processing your request...",
    analyzing: "Let me analyze that...",
    noResponse: "No response content",
    calculationError: "I'm having trouble calculating that right now. Please try again.",
  },
  ar: {
    thinking: "أنا أفكر في هذا...",
    working: "أعمل على سؤالك...",
    processing: "جاري معالجة طلبك...",
    analyzing: "دعني أحلل ذلك...",
    noResponse: "لا يوجد محتوى للرد",
    calculationError: "أواجه صعوبة في حساب ذلك الآن. يرجى المحاولة مرة أخرى.",
  },
}

// Helper function to detect current language
function getCurrentLanguage(): "en" | "ar" {
  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    // First check localStorage as it's the most reliable source
    const storedLanguage = localStorage.getItem("language") as "en" | "ar"
    if (storedLanguage && ["en", "ar"].includes(storedLanguage)) {
      return storedLanguage
    }

    // Then check HTML dir attribute
    const htmlDir = document.documentElement.getAttribute("dir")
    if (htmlDir === "rtl") {
      return "ar"
    }

    // Then check HTML lang attribute
    const htmlLang = document.documentElement.lang
    if (htmlLang === "ar") {
      return "ar"
    }

    // Finally check browser language
    const browserLang = navigator.language.split("-")[0]
    if (browserLang === "ar") {
      return "ar"
    }
  }

  // Default to English
  return "en"
}

// Get a random placeholder message in the current language
function getRandomPlaceholder(): string {
  const lang = getCurrentLanguage()
  const placeholders = [
    PLACEHOLDER_MESSAGES[lang].thinking,
    PLACEHOLDER_MESSAGES[lang].working,
    PLACEHOLDER_MESSAGES[lang].processing,
    PLACEHOLDER_MESSAGES[lang].analyzing,
  ]
  return placeholders[Math.floor(Math.random() * placeholders.length)]
}

/**
 * API client for handling all external communications
 */
export class ApiClient {
  private supabase = createClientComponentClient()
  private abortController: AbortController | null = null
  private pendingConversations = new Map<string, Promise<string | null>>()
  private requestCount = 0
  private lastRequestTime = 0
  private pendingRequests = new Map<string, boolean>() // Track pending requests by message ID
  private lastRequestId: string | null = null

  /**
   * Convert a file to base64
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64 = reader.result.split(",")[1]
          resolve(base64)
        } else {
          reject(new Error("Failed to convert file to base64"))
        }
      }
      reader.onerror = (error) => reject(error)
    })
  }

  /**
   * Process files for sending to the webhook
   */
  private async processFiles(
    files?: File[],
  ): Promise<Array<{ name: string; type: string; size: number; base64: string }> | undefined> {
    if (!files || files.length === 0) return undefined

    const processedFiles = []

    for (const file of files) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        console.warn(`File ${file.name} exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
        continue
      }

      try {
        const base64 = await this.fileToBase64(file)
        processedFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          base64,
        })
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
      }
    }

    return processedFiles.length > 0 ? processedFiles : undefined
  }

  /**
   * Send a message to the AI model and get a streaming response
   * If streaming fails, falls back to regular request
   */
  async streamMessage(
    message: string,
    model: AIModel,
    userId: string,
    onChunk: (chunk: string) => void,
    onComplete: (fullText: string) => void,
    onError: (error: string) => void,
    conversationId: string | null = null,
    isNewConversation = false,
    conversationHistory: Message[] = [],
    files?: File[],
  ): Promise<void> {
    // Generate a unique request ID
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // Store this as the last request ID
    this.lastRequestId = requestId

    try {
      // Check if we have too many pending requests
      if (this.pendingRequests.size >= 2) {
        // Cancel the oldest request
        const oldestRequestId = Array.from(this.pendingRequests.keys())[0]
        console.log(`Too many pending requests. Cancelling oldest request: ${oldestRequestId}`)
        this.cancelRequest()
        this.pendingRequests.delete(oldestRequestId)
      }

      // Add this request to pending requests
      this.pendingRequests.set(requestId, true)

      // Cancel any existing requests
      this.cancelRequest()

      // Create a new abort controller for this request
      this.abortController = new AbortController()
      const signal = this.abortController.signal

      // Set up timeout
      const timeoutId = setTimeout(() => {
        if (this.abortController && this.lastRequestId === requestId) {
          console.log(`Request ${requestId} timed out after ${REQUEST_TIMEOUT}ms`)
          this.abortController.abort("Request timeout")
          this.pendingRequests.delete(requestId)
        }
      }, REQUEST_TIMEOUT)

      // Get the webhook URL for the selected model
      const webhookUrl = WEBHOOK_URLS[model]

      // Format conversation history for the webhook
      // Filter out system messages and error messages
      // Limit to the most recent MAX_HISTORY_MESSAGES messages
      const formattedHistory = conversationHistory
        .filter((msg) => msg.role !== "system" && !msg.error)
        .slice(-MAX_HISTORY_MESSAGES) // Take only the most recent messages
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
        }))

      console.log(`[${requestId}] Sending message with ${formattedHistory.length} history messages to ${model}`)

      // Process files if any
      const processedFiles = await this.processFiles(files)

      if (files && files.length > 0) {
        console.log(`[${requestId}] Sending ${files.length} files with the message`)
      }

      // Start simulating typing immediately for better UX
      let typingSimulationDone = false
      const typingPromise = this.startTypingSimulation(message, onChunk, signal).then(() => {
        typingSimulationDone = true
      })

      // Track request count and implement rate limiting
      this.requestCount++
      const now = Date.now()
      const timeSinceLastRequest = now - this.lastRequestTime

      // If we've made too many requests in a short time, add a delay
      if (this.requestCount > 5 && timeSinceLastRequest < 5000) {
        const delayTime = Math.min(2000, 5000 - timeSinceLastRequest)
        console.log(`[${requestId}] Rate limiting: Adding ${delayTime}ms delay before request`)
        await new Promise((resolve) => setTimeout(resolve, delayTime))
      }

      this.lastRequestTime = Date.now()

      // Try multiple times with exponential backoff
      let attempt = 0
      let lastError: Error | null = null
      let responseReceived = false

      while (attempt < MAX_RETRIES && !responseReceived && this.lastRequestId === requestId) {
        if (attempt > 0) {
          console.log(`[${requestId}] Retry attempt ${attempt} for streaming request`)
          // Add exponential backoff delay
          const backoffDelay = Math.pow(2, attempt) * 500 // 500ms, 1s, 2s
          await new Promise((resolve) => setTimeout(resolve, backoffDelay))
        }

        try {
          // Prepare the request payload
          const payload = {
            message,
            model,
            timestamp: new Date().toISOString(),
            conversation_id: conversationId,
            is_new_conversation: isNewConversation,
            user_id: userId, // This will now accept "anonymous" for non-logged in users
            conversation_history: formattedHistory,
            request_id: requestId, // Add request ID to help with debugging
            has_files: processedFiles && processedFiles.length > 0, // Add this to indicate files are attached
            file_count: processedFiles?.length || 0, // Add file count
            files: processedFiles, // Add the processed files
          }

          // Wait for typing simulation to complete before sending the actual request
          // This ensures we don't replace the typing animation too quickly
          if (!typingSimulationDone) {
            await typingPromise
          }

          // Send the request
          const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Request-ID": requestId,
            },
            body: JSON.stringify(payload),
            signal,
          })

          // Check if the request was successful
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`)
          }

          // Get the response text
          const responseText = await response.text()
          responseReceived = true

          // Try to parse as JSON
          let finalText = ""
          try {
            const jsonResponse = JSON.parse(responseText)
            finalText = jsonResponse.response || ""
          } catch (e) {
            // If not JSON, use the raw text
            finalText = responseText || ""
          }

          // Get the current language
          const lang = getCurrentLanguage()
          const placeholders = PLACEHOLDER_MESSAGES[lang]

          // Check if the response is empty or just contains placeholder text
          if (
            !finalText ||
            finalText === placeholders.noResponse ||
            finalText.includes(placeholders.thinking) ||
            finalText.includes(placeholders.working) ||
            finalText.includes(placeholders.processing) ||
            finalText.includes(placeholders.analyzing)
          ) {
            // For math expressions, provide a direct answer
            if (/[\d\s+\-*/()]+/.test(message) && /[+\-*/]/.test(message)) {
              try {
                // Clean the expression
                const mathExpression = message.replace(/[^0-9+\-*/().]/g, "").trim()
                // Use Function constructor to safely evaluate the math expression
                const result = new Function(`return ${mathExpression}`)()
                finalText =
                  lang === "ar"
                    ? `🧮 نتيجة الحساب\n\n\n${mathExpression} = ${result}`
                    : `🧮 Calculation Result\n\n\n${mathExpression} = ${result}`
              } catch (error) {
                console.error(`[${requestId}] Failed to calculate math expression:`, error)
                finalText = placeholders.calculationError
              }
            } else {
              // Generate a fallback response
              finalText = this.generateFallbackResponse(message, conversationHistory)
            }
          }

          // Clear the timeout
          clearTimeout(timeoutId)

          // Call the completion callback with the full text
          if (this.lastRequestId === requestId) {
            onComplete(finalText)
          }

          // Reset request count after successful request
          if (this.requestCount > 10) {
            this.requestCount = Math.max(1, this.requestCount - 5)
          }

          // Remove this request from pending requests
          this.pendingRequests.delete(requestId)

          return
        } catch (error: any) {
          lastError = error
          console.error(`[${requestId}] Error in attempt ${attempt}:`, error)

          // If the request was aborted, don't retry
          if (error.name === "AbortError") {
            break
          }

          attempt++
        }
      }

      // If we get here, all attempts failed
      // Check if the request was aborted
      if (lastError?.name === "AbortError") {
        onError("Request timed out. Please try again.")
        return
      }

      // Handle other errors
      onError(lastError?.message || "Unknown error")

      // Try fallback to regular request if this wasn't a cancellation
      if (lastError?.name !== "AbortError" && this.lastRequestId === requestId) {
        try {
          console.log(`[${requestId}] Streaming failed, falling back to regular request`)
          const response = await this.sendMessage(
            message,
            model,
            userId,
            conversationId,
            isNewConversation,
            conversationHistory,
            files,
          )

          if (!response.error) {
            // Call the completion callback with the response text
            onComplete(response.text)
          } else {
            onError(response.error)
          }
        } catch (fallbackError: any) {
          onError(`Fallback also failed: ${fallbackError.message || "Unknown error"}`)
        }
      }
    } catch (error: any) {
      // Handle unexpected errors
      onError(`Unexpected error: ${error.message || "Unknown error"}`)
    } finally {
      // Clean up
      if (this.lastRequestId === requestId) {
        this.abortController = null
        this.lastRequestId = null
      }
      this.pendingRequests.delete(requestId)
    }
  }

  /**
   * Generate a fallback response based on the message and conversation history
   */
  private generateFallbackResponse(message: string, conversationHistory: Message[]): string {
    const lang = getCurrentLanguage()

    // Check if it's a math expression
    if (/[\d\s+\-*/()]+/.test(message) && /[+\-*/]/.test(message)) {
      try {
        // Clean the expression
        const mathExpression = message.replace(/[^0-9+\-*/().]/g, "").trim()
        // Use Function constructor to safely evaluate the math expression
        const result = new Function(`return ${mathExpression}`)()
        return lang === "ar"
          ? `🧮 نتيجة الحساب\n\n\n${mathExpression} = ${result}`
          : `🧮 Calculation Result\n\n\n${mathExpression} = ${result}`
      } catch (error) {
        console.error("Failed to calculate math expression:", error)
      }
    }

    // Check if it's a number sequence question
    if (message.toLowerCase().includes("and") && /^\d+$/.test(message.replace(/and/i, "").trim())) {
      const numberStr = message.replace(/and/i, "").trim()
      const number = Number.parseInt(numberStr, 10)
      if (!isNaN(number)) {
        return lang === "ar"
          ? `الرقم التالي بعد ${number} هو ${number + 1}.`
          : `The next number after ${number} is ${number + 1}.`
      }
    }

    // Check if it's a greeting
    if (/^(hi|hello|hey|greetings)/i.test(message)) {
      return lang === "ar" ? "مرحباً! كيف يمكنني مساعدتك اليوم؟" : "Hello! How can I help you today?"
    }

    // Check if it's a thank you
    if (/^(thanks|thank you|thx)/i.test(message)) {
      return lang === "ar"
        ? "على الرحب والسعة! هل هناك أي شيء آخر يمكنني مساعدتك به؟"
        : "You're welcome! Is there anything else I can help you with?"
    }

    // Check if it's a question about capabilities
    if (/what can you do|your capabilities|help me with/i.test(message)) {
      return lang === "ar"
        ? "يمكنني المساعدة في الإجابة على الأسئلة، وكتابة المحتوى، وشرح المفاهيم، والكثير غير ذلك. بماذا ترغب في المساعدة؟"
        : "I can help with answering questions, writing content, explaining concepts, and much more. What would you like assistance with?"
    }

    // Default response
    return lang === "ar"
      ? "أفهم سؤالك. دعني أقدم إجابة مفيدة بناءً على ما أعرفه. إذا لم تكن هذه الإجابة كافية، فلا تتردد في طلب المزيد من التفاصيل."
      : "I understand your question. Let me provide a helpful response based on what I know. If this doesn't fully address your question, please feel free to ask for more details."
  }

  /**
   * Start simulating typing immediately for better UX
   * This gives immediate feedback while waiting for the actual response
   */
  private async startTypingSimulation(
    prompt: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    // Get a random placeholder in the current language
    const initialResponse = getRandomPlaceholder()

    // Send the initial response character by character
    for (let i = 0; i < initialResponse.length; i++) {
      if (signal?.aborted) break

      onChunk(initialResponse[i])
      await new Promise((resolve) => setTimeout(resolve, 20 + Math.random() * 30))
    }

    // Add a newline and pause
    if (!signal?.aborted) {
      onChunk("\n\n")
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }

  /**
   * Simulate streaming by chunking text and sending it with delays
   */
  private async simulateStreaming(text: string, onChunk: (chunk: string) => void, signal?: AbortSignal): Promise<void> {
    // Split the text into words
    const words = text.split(" ")
    let currentIndex = 0

    // Send chunks of 1-3 words at a time
    while (currentIndex < words.length) {
      // Check if the request was aborted
      if (signal?.aborted) {
        break
      }

      // Determine chunk size (1-3 words)
      const chunkSize = Math.min(Math.floor(Math.random() * 3) + 1, words.length - currentIndex)

      // Create and send the chunk
      const chunk = words.slice(currentIndex, currentIndex + chunkSize).join(" ") + " "
      onChunk(chunk)

      // Move to the next chunk
      currentIndex += chunkSize

      // Add a small random delay between chunks (20-80ms)
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 60 + 20))
    }
  }

  /**
   * Send a message to the AI model and get a response
   */
  async sendMessage(
    message: string,
    model: AIModel,
    userId: string,
    conversationId: string | null = null,
    isNewConversation = false,
    conversationHistory: Message[] = [],
    files?: File[],
  ): Promise<AIResponse> {
    // Generate a unique request ID
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    try {
      // Cancel any existing requests
      this.cancelRequest()

      // Create a new abort controller for this request
      this.abortController = new AbortController()
      const signal = this.abortController.signal

      // Set up timeout
      const timeoutId = setTimeout(() => {
        if (this.abortController) {
          this.abortController.abort("Request timeout")
        }
      }, REQUEST_TIMEOUT)

      // Get the webhook URL for the selected model
      const webhookUrl = WEBHOOK_URLS[model]

      // Format conversation history for the webhook
      // Filter out system messages and error messages
      // Limit to the most recent MAX_HISTORY_MESSAGES messages
      const formattedHistory = conversationHistory
        .filter((msg) => msg.role !== "system" && !msg.error)
        .slice(-MAX_HISTORY_MESSAGES) // Take only the most recent messages
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
        }))

      console.log(`[${requestId}] Sending message with ${formattedHistory.length} history messages to ${model}`)

      // Process files if any
      const processedFiles = await this.processFiles(files)

      if (files && files.length > 0) {
        console.log(`[${requestId}] Sending ${files.length} files with the message`)
      }

      // Try multiple times with exponential backoff
      let attempt = 0
      let lastError: Error | null = null

      while (attempt < MAX_RETRIES) {
        if (attempt > 0) {
          console.log(`[${requestId}] Retry attempt ${attempt} for regular request`)
          // Add exponential backoff delay
          const backoffDelay = Math.pow(2, attempt) * 500 // 500ms, 1s, 2s
          await new Promise((resolve) => setTimeout(resolve, backoffDelay))
        }

        try {
          // Prepare the request payload
          const payload = {
            message,
            model,
            timestamp: new Date().toISOString(),
            conversation_id: conversationId,
            is_new_conversation: isNewConversation,
            user_id: userId, // This will now accept "anonymous" for non-logged in users
            conversation_history: formattedHistory,
            request_id: requestId, // Add request ID to help with debugging
            has_files: processedFiles && processedFiles.length > 0, // Add this to indicate files are attached
            file_count: processedFiles?.length || 0, // Add file count
            files: processedFiles, // Add the processed files
          }

          // Send the request
          const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Request-ID": requestId,
            },
            body: JSON.stringify(payload),
            signal,
          })

          // Clear the timeout
          clearTimeout(timeoutId)

          // Check if the request was successful
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`)
          }

          // Get the response text
          const responseText = await response.text()

          // Get the current language
          const lang = getCurrentLanguage()
          const placeholders = PLACEHOLDER_MESSAGES[lang]

          // Try to parse as JSON
          try {
            const jsonResponse = JSON.parse(responseText)
            let text = jsonResponse.response || ""

            // Check if the response is empty or just contains placeholder text
            if (
              !text ||
              text === placeholders.noResponse ||
              text.includes(placeholders.thinking) ||
              text.includes(placeholders.working) ||
              text.includes(placeholders.processing) ||
              text.includes(placeholders.analyzing)
            ) {
              // For math expressions, provide a direct answer
              if (/[\d\s+\-*/()]+/.test(message) && /[+\-*/]/.test(message)) {
                try {
                  // Clean the expression
                  const mathExpression = message.replace(/[^0-9+\-*/().]/g, "").trim()
                  // Use Function constructor to safely evaluate the math expression
                  const result = new Function(`return ${mathExpression}`)()
                  text =
                    lang === "ar"
                      ? `🧮 نتيجة الحساب\n\n\n${mathExpression} = ${result}`
                      : `🧮 Calculation Result\n\n\n${mathExpression} = ${result}`
                } catch (error) {
                  console.error(`[${requestId}] Failed to calculate math expression:`, error)
                  text = placeholders.calculationError
                }
              } else {
                // Generate a fallback response
                text = this.generateFallbackResponse(message, conversationHistory)
              }
            }

            return {
              text,
              model,
            }
          } catch (e) {
            // If not JSON, use the raw text
            let text = responseText || ""

            // Get the current language
            const lang = getCurrentLanguage()
            const placeholders = PLACEHOLDER_MESSAGES[lang]

            // Check if the response is empty or contains placeholder text
            if (
              !text ||
              text === placeholders.noResponse ||
              text.includes(placeholders.thinking) ||
              text.includes(placeholders.working) ||
              text.includes(placeholders.processing) ||
              text.includes(placeholders.analyzing)
            ) {
              // For math expressions, provide a direct answer
              if (/[\d\s+\-*/()]+/.test(message) && /[+\-*/]/.test(message)) {
                try {
                  // Clean the expression
                  const mathExpression = message.replace(/[^0-9+\-*/().]/g, "").trim()
                  // Use Function constructor to safely evaluate the math expression
                  const result = new Function(`return ${mathExpression}`)()
                  text =
                    lang === "ar"
                      ? `🧮 نتيجة الحساب\n\n\n${mathExpression} = ${result}`
                      : `🧮 Calculation Result\n\n\n${mathExpression} = ${result}`
                } catch (error) {
                  console.error(`[${requestId}] Failed to calculate math expression:`, error)
                  text = placeholders.calculationError
                }
              } else {
                // Generate a fallback response
                text = this.generateFallbackResponse(message, conversationHistory)
              }
            }

            return {
              text,
              model,
            }
          }
        } catch (error: any) {
          lastError = error
          console.error(`[${requestId}] Error in attempt ${attempt}:`, error)

          // If the request was aborted, don't retry
          if (error.name === "AbortError") {
            break
          }

          attempt++
        }
      }

      // If we get here, all attempts failed
      // Check if the request was aborted
      if (lastError?.name === "AbortError") {
        return {
          text: "Request timed out. Please try again.",
          model,
          error: "timeout",
        }
      }

      // Handle other errors
      return {
        text: `Error: ${lastError?.message || "Unknown error"}`,
        model,
        error: lastError?.message || "unknown",
      }
    } catch (error: any) {
      // Handle unexpected errors
      return {
        text: `Unexpected error: ${error.message || "Unknown error"}`,
        model,
        error: error.message || "unknown",
      }
    } finally {
      // Clean up
      this.abortController = null
    }
  }

  /**
   * Cancel the current request
   */
  cancelRequest() {
    if (this.abortController) {
      this.abortController.abort("Request cancelled")
      this.abortController = null
    }
  }

  /**
   * Create a new conversation in the database
   * Uses a cache to prevent duplicate requests
   */
  async createConversation(userId: string, title: string): Promise<string | null> {
    const cacheKey = `${userId}:${title}`

    // Check if we already have a pending request for this conversation
    if (this.pendingConversations.has(cacheKey)) {
      return this.pendingConversations.get(cacheKey)!
    }

    // Create a new promise for this conversation
    const promise = this._createConversationInternal(userId, title)
    this.pendingConversations.set(cacheKey, promise)

    try {
      // Wait for the promise to resolve
      const result = await promise
      return result
    } finally {
      // Remove the promise from the cache
      this.pendingConversations.delete(cacheKey)
    }
  }

  /**
   * Internal method to create a conversation
   */
  private async _createConversationInternal(userId: string, title: string): Promise<string | null> {
    try {
      // If this is an anonymous user, use a special user ID instead of null
      const actualUserId = userId === "anonymous" ? ANONYMOUS_USER_ID : userId

      // Create a new conversation with only the essential fields
      const conversationData = {
        user_id: actualUserId, // Use the special anonymous ID instead of null
        title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Insert the conversation
      const { data, error } = await this.supabase
        .from("chat_conversations")
        .insert([conversationData])
        .select("id")
        .single()

      if (error) {
        console.error("Error creating conversation:", error)
        return null
      }

      return data.id
    } catch (error) {
      console.error("Error creating conversation:", error)
      return null
    }
  }

  /**
   * Save messages to the database
   * Returns immediately but continues saving in the background
   */
  async saveMessages(conversationId: string, userMessage: Message, assistantMessage: Message): Promise<boolean> {
    // Start the save operation but don't await it
    this._saveMessagesInternal(conversationId, userMessage, assistantMessage)

    // Return true immediately for better UX
    return true
  }

  /**
   * Internal method to save messages
   */
  private async _saveMessagesInternal(
    conversationId: string,
    userMessage: Message,
    assistantMessage: Message,
  ): Promise<void> {
    try {
      console.log(`Starting to save messages to conversation ${conversationId}`)

      // Update the conversation's updated_at timestamp
      const { error: updateError } = await this.supabase
        .from("chat_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId)

      if (updateError) {
        console.error("Error updating conversation timestamp:", updateError)
      }

      // Create timestamps with a small offset to ensure proper ordering
      const userTimestamp = userMessage.timestamp
      const assistantTimestamp = new Date(userTimestamp.getTime() + 100) // 100ms later

      // Save user message with only essential fields
      try {
        const userMessageData = {
          conversation_id: conversationId,
          content: userMessage.content,
          role: userMessage.role,
          ai_model: userMessage.model?.toLowerCase() || assistantMessage.model?.toLowerCase() || "chatgpt", // Default to ChatGPT if no model is specified
          created_at: userTimestamp.toISOString(),
          tokens_used: 0,
        }

        const { data: userData, error: userError } = await this.supabase
          .from("chat_messages")
          .insert([userMessageData])
          .select()

        if (userError) {
          console.error("Error saving user message:", userError)
        } else {
          console.log("Successfully saved user message:", {
            id: userData?.[0]?.id,
            role: "user",
            content: userMessage.content.substring(0, 20) + "...",
          })
        }
      } catch (error) {
        console.error("Error saving user message with basic fields:", error)
      }

      // Save assistant message with only essential fields
      try {
        const assistantMessageData = {
          conversation_id: conversationId,
          content: assistantMessage.content,
          role: assistantMessage.role,
          ai_model: assistantMessage.model?.toLowerCase() || null,
          created_at: assistantTimestamp.toISOString(), // Use the offset timestamp
          tokens_used: 0,
        }

        const { data: assistantData, error: assistantError } = await this.supabase
          .from("chat_messages")
          .insert([assistantMessageData])
          .select()

        if (assistantError) {
          console.error("Error saving assistant message:", assistantError)
        } else {
          console.log("Successfully saved assistant message:", {
            id: assistantData?.[0]?.id,
            role: "assistant",
            content: assistantMessage.content.substring(0, 20) + "...",
          })
        }
      } catch (error) {
        console.error("Error saving assistant message with basic fields:", error)
      }

      console.log(
        `Saved messages with timestamps: User=${userTimestamp.toISOString()}, Assistant=${assistantTimestamp.toISOString()}`,
      )
    } catch (error) {
      console.error("Error saving messages:", error)
    }
  }

  /**
   * Fetch a conversation by ID
   */
  async fetchConversation(conversationId: string, userId: string): Promise<Conversation | null> {
    // If userId is "anonymous", we can't fetch from the database
    if (userId === "anonymous") {
      console.log("Anonymous user cannot fetch conversations from database")
      return {
        id: null,
        title: "New Conversation",
        messages: [],
      }
    }

    // Maximum number of retry attempts
    const maxRetries = 3
    let retryCount = 0
    let lastError: any = null

    while (retryCount < maxRetries) {
      try {
        console.log(`Attempt ${retryCount + 1} to fetch conversation ${conversationId} for user ${userId}`)

        // Fetch the conversation
        const { data: conversation, error: conversationError } = await this.supabase
          .from("chat_conversations")
          .select("*")
          .eq("id", conversationId)
          .eq("user_id", userId)
          .maybeSingle() // Use maybeSingle instead of single to handle no rows gracefully

        if (conversationError) {
          console.error(`Error fetching conversation (attempt ${retryCount + 1}):`, conversationError)
          lastError = conversationError
          retryCount++

          // Wait before retrying (exponential backoff)
          if (retryCount < maxRetries) {
            const delay = Math.pow(2, retryCount) * 500 // 500ms, 1s, 2s
            await new Promise((resolve) => setTimeout(resolve, delay))
            continue
          }
          return null
        }

        // If no conversation was found, return null
        if (!conversation) {
          console.log(`No conversation found with ID ${conversationId}`)
          return null
        }

        // Fetch messages for this conversation with more precise ordering
        const { data: messages, error: messagesError } = await this.supabase
          .from("chat_messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true })
          .order("id", { ascending: true }) // Secondary sort by ID to handle same-timestamp messages

        if (messagesError) {
          console.error(`Error fetching messages (attempt ${retryCount + 1}):`, messagesError)
          // Return conversation with empty messages array rather than null
          return {
            id: conversation.id,
            title: conversation.title,
            messages: [],
          }
        }

        // Debug log all messages from database
        console.log(
          "Raw messages from database:",
          messages.map((m) => ({
            id: m.id.substring(0, 8),
            role: m.role,
            content: m.content.substring(0, 20) + "...",
          })),
        )

        // Format messages with precise timestamps
        const formattedMessages: Message[] = messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role as MessageRole,
          timestamp: new Date(msg.created_at),
          model: (msg.ai_model === "chatgpt" ? "ChatGPT" : "Gemini") as AIModel,
        }))

        // Ensure messages are sorted by timestamp and then by ID
        formattedMessages.sort((a, b) => {
          const timeA = a.timestamp.getTime()
          const timeB = b.timestamp.getTime()

          // If timestamps are the same, sort by ID
          if (timeA === timeB) {
            return a.id.localeCompare(b.id)
          }

          return timeA - timeB
        })

        // Log the sorted messages for debugging
        console.log(
          "Sorted messages:",
          formattedMessages.map((m) => ({
            id: m.id.substring(0, 8),
            role: m.role,
            timestamp: m.timestamp.toISOString(),
            content: m.content.substring(0, 20) + "...",
          })),
        )

        console.log(`Successfully fetched ${formattedMessages.length} messages for conversation ${conversationId}`)

        return {
          id: conversation.id,
          title: conversation.title,
          messages: formattedMessages,
        }
      } catch (error) {
        console.error(`Unexpected error fetching conversation (attempt ${retryCount + 1}):`, error)
        lastError = error
        retryCount++

        // Wait before retrying (exponential backoff)
        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 500 // 500ms, 1s, 2s
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    console.error(`Failed to fetch conversation after ${maxRetries} attempts. Last error:`, lastError)
    return null
  }

  /**
   * Delete a conversation and all its messages
   */
  async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    try {
      // If this is an anonymous user, use the special user ID
      const actualUserId = userId === "anonymous" ? ANONYMOUS_USER_ID : userId

      // First delete all messages for this conversation
      const { error: messagesError } = await this.supabase
        .from("chat_messages")
        .delete()
        .eq("conversation_id", conversationId)

      if (messagesError) {
        console.error("Error deleting conversation messages:", messagesError)
        return false
      }

      // Then delete the conversation itself
      const { error: conversationError } = await this.supabase
        .from("chat_conversations")
        .delete()
        .eq("id", conversationId)
        .eq("user_id", actualUserId)

      if (conversationError) {
        console.error("Error deleting conversation:", conversationError)
        return false
      }

      return true
    } catch (error) {
      console.error("Unexpected error deleting conversation:", error)
      return false
    }
  }

  /**
   * Fetch daily message count for a user
   */
  async fetchDailyMessageCount(userId: string): Promise<number> {
    try {
      // If this is an anonymous user, use the special user ID
      const actualUserId = userId === "anonymous" ? ANONYMOUS_USER_ID : userId

      // Get today's date in ISO format (YYYY-MM-DD)
      const today = new Date().toISOString().split("T")[0]

      // Get all conversations for this user
      const { data: conversations, error: conversationsError } = await this.supabase
        .from("chat_conversations")
        .select("id")
        .eq("user_id", actualUserId)

      if (conversationsError || !conversations || conversations.length === 0) {
        return 0
      }

      // Extract conversation IDs
      const conversationIds = conversations.map((conv) => conv.id)

      // Count messages for these conversations from today
      const { data, error: countError } = await this.supabase
        .from("chat_messages")
        .select("id")
        .in("conversation_id", conversationIds)
        .eq("role", "user")
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${today}T23:59:59.999`)

      if (countError) {
        return 0
      }

      return data?.length || 0
    } catch (error) {
      console.error("Error fetching daily message count:", error)
      return 0
    }
  }

  /**
   * Ensure user profile exists
   */
  async ensureUserProfile(userId: string, email?: string): Promise<boolean> {
    try {
      // Don't create profiles for anonymous users
      if (userId === "anonymous") {
        return true
      }

      // Check if user profile exists
      const { data: profile, error: profileError } = await this.supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single()

      // If profile exists, return true
      if (profile) {
        return true
      }

      // If profile doesn't exist, create it
      if (profileError && profileError.code === "PGRST116") {
        const { error: insertError } = await this.supabase.from("profiles").insert([
          {
            id: userId,
            display_name: email?.split("@")[0] || "User",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            theme_preference: "dark",
            email_notifications: false,
          },
        ])

        if (insertError) {
          console.error("Error creating user profile:", insertError)
          return false
        }

        return true
      }

      return false
    } catch (error) {
      console.error("Error ensuring user profile:", error)
      return false
    }
  }
}

// Export a singleton instance
export const apiClient = new ApiClient()
