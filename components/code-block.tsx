"use client"

import { useState, useRef, useEffect } from "react"
import { Check, Copy } from "lucide-react"

interface CodeBlockProps {
  language: string
  code: string
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const codeRef = useRef<HTMLElement>(null)

  // Normalize language name for highlight.js
  const normalizeLanguage = (lang: string) => {
    const languageMap: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      jsx: "javascript",
      tsx: "typescript",
      py: "python",
      rb: "ruby",
      sh: "bash",
      yml: "yaml",
      md: "markdown",
    }

    return languageMap[lang.toLowerCase()] || lang.toLowerCase()
  }

  // Apply syntax highlighting
  useEffect(() => {
    // Try to apply highlighting if hljs is available globally
    if (typeof window !== "undefined" && window.hljs && codeRef.current) {
      try {
        // Manually trigger highlighting for this element
        window.hljs.highlightElement(codeRef.current)
      } catch (error) {
        console.error("Error highlighting code:", error)
      }
    }
  }, [code, language])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  return (
    <div className="my-4 rounded-md border border-[#333] bg-[#0d0d0d] text-sm">
      <div className="flex items-center justify-between border-b border-[#333] px-4 py-2">
        <span className="text-xs text-gray-400">{language || "plaintext"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "Copied!" : "Copy code"}</span>
        </button>
      </div>
      <div className="overflow-x-auto p-4">
        <pre className="hljs">
          <code ref={codeRef} className={`language-${normalizeLanguage(language || "plaintext")}`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  )
}

// Add TypeScript declaration for hljs
declare global {
  interface Window {
    hljs: {
      highlightAll: () => void
      highlightElement: (element: HTMLElement) => void
    }
  }
}
