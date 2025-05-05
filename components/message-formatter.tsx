"use client"

import React from "react"

import { useEffect, useRef } from "react"
import { CodeBlock } from "./code-block"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MessageFormatterProps {
  content: string
}

export function MessageFormatter({ content }: MessageFormatterProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  // Function to detect and format code blocks
  const formatMessage = () => {
    // Split the content by code block markers \`\`\`
    const parts = content.split(/(```[\s\S]*?```)/g)

    return parts.map((part, index) => {
      // Check if this part is a code block
      if (part.startsWith("```") && part.endsWith("```")) {
        // Extract language and code
        const match = part.match(/```(\w*)\n([\s\S]*?)```/)

        if (match) {
          const language = match[1] || "plaintext"
          const code = match[2]

          return <CodeBlock key={index} language={language} code={code} />
        }
      }

      // For regular text, use ReactMarkdown to parse markdown
      return (
        <div key={index} className="message-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, ...props }) => <p className="my-1" {...props} />,
              h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-md font-bold mt-2 mb-1" {...props} />,
              ul: ({ node, ...props }) => <ul className="message-list" {...props} />,
              ol: ({ node, ...props }) => <ol className="message-list-numbered" {...props} />,
              li: ({ node, children, ...props }) => {
                // Check if this list item contains a ul or ol
                const hasNestedList = React.Children.toArray(children).some(
                  (child) => React.isValidElement(child) && (child.type === "ul" || child.type === "ol"),
                )

                return (
                  <li className={`message-list-item ${hasNestedList ? "has-list" : ""}`} {...props}>
                    {children}
                  </li>
                )
              },
              blockquote: ({ node, children, ...props }) => (
                <blockquote className="border-l-4 border-gray-700 pl-3 my-2" {...props}>
                  {children}
                </blockquote>
              ),
              hr: ({ node, ...props }) => <hr className="my-3 border-gray-700" {...props} />,
              a: ({ node, ...props }) => (
                <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
              ),
              strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
              em: ({ node, ...props }) => <em className="italic" {...props} />,
              code: ({ node, inline, ...props }) =>
                inline ? <code className="bg-gray-800 rounded px-1 py-0.5 text-sm" {...props} /> : <code {...props} />,
              pre: ({ node, ...props }) => <pre className="my-2" {...props} />,
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-2">
                  <table className="min-w-full" {...props} />
                </div>
              ),
              thead: ({ node, ...props }) => <thead {...props} />,
              tbody: ({ node, ...props }) => <tbody {...props} />,
              tr: ({ node, ...props }) => <tr {...props} />,
              th: ({ node, ...props }) => (
                <th
                  style={{
                    backgroundColor: "rgb(26 26 26)",
                    border: "1px solid #333333",
                    padding: "18px 10px",
                  }}
                  {...props}
                />
              ),
              td: ({ node, ...props }) => (
                <td
                  style={{
                    borderColor: "rgb(51 51 51)",
                    padding: "18px 10px",
                  }}
                  {...props}
                />
              ),
            }}
          >
            {part}
          </ReactMarkdown>
        </div>
      )
    })
  }

  // Process nested lists after rendering
  useEffect(() => {
    if (contentRef.current) {
      // Find all list items that contain other lists
      const listItemsWithLists = contentRef.current.querySelectorAll("li > ul, li > ol")

      // Add a class to their parent li elements
      listItemsWithLists.forEach((nestedList) => {
        const parentLi = nestedList.parentElement
        if (parentLi) {
          parentLi.classList.add("has-list")
        }
      })
    }
  }, [content])

  // Trigger highlighting after component mounts or updates
  useEffect(() => {
    if (typeof window !== "undefined" && window.hljs) {
      setTimeout(() => {
        try {
          window.hljs.highlightAll()
        } catch (error) {
          console.error("Error highlighting code blocks:", error)
        }
      }, 100)
    }
  }, [content])

  return (
    <div className="whitespace-pre-wrap text-sm" ref={contentRef}>
      {formatMessage()}
    </div>
  )
}
