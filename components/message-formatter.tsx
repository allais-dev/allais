"use client"

import { useEffect } from "react"
import { CodeBlock } from "./code-block"

interface MessageFormatterProps {
  content: string
}

export function MessageFormatter({ content }: MessageFormatterProps) {
  // Function to extract code blocks from the message
  const extractCodeBlocks = (text: string) => {
    const codeBlockRegex = /```(\w+)?\s*\n([\s\S]*?)\n```/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
        })
      }

      // Add code block
      parts.push({
        type: "code",
        language: match[1] || "plaintext",
        content: match[2],
      })

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex),
      })
    }

    return parts
  }

  // Process the message content
  const messageParts = extractCodeBlocks(content)

  // Update the renderTextWithHTML function to add a section-divider class to h3 elements
  // Replace the existing renderTextWithHTML function with this updated version:

  const renderTextWithHTML = (text: string) => {
    // Wrap the entire content in an article tag
    let processedText = text

    // Convert markdown-style headings to h3 with a section-divider class
    processedText = processedText.replace(/^###\s+(.+)$/gm, '<h3 class="section-divider">$1</h3>')
    processedText = processedText.replace(/^##\s+(.+)$/gm, '<h3 class="section-divider">$1</h3>')
    processedText = processedText.replace(/^#\s+(.+)$/gm, '<h3 class="section-divider">$1</h3>')

    // Convert paragraphs (lines with content followed by blank lines)
    processedText = processedText.replace(/^([^\n<][^\n]+)(?:\n{2,}|$)/gm, "<p>$1</p>")

    // Convert unordered lists
    let listMatch
    const ulRegex = /^[ \t]*[-*+][ \t]+(.*?)(?:\n(?![ \t]*[-*+][ \t])|\n*$)/gms
    while ((listMatch = ulRegex.exec(processedText)) !== null) {
      const listItems = listMatch[0].split("\n").filter((line) => line.trim().match(/^[-*+]/))
      const formattedItems = listItems.map((item) => `<li>${item.replace(/^[ \t]*[-*+][ \t]+/, "")}</li>`).join("")
      processedText = processedText.replace(listMatch[0], `<ul class="article-list">${formattedItems}</ul>`)
    }

    // Convert ordered lists
    const olRegex = /^[ \t]*\d+\.[ \t]+(.*?)(?:\n(?![ \t]*\d+\.[ \t])|\n*$)/gms
    while ((listMatch = olRegex.exec(processedText)) !== null) {
      const listItems = listMatch[0].split("\n").filter((line) => line.trim().match(/^\d+\./))
      const formattedItems = listItems.map((item) => `<li>${item.replace(/^[ \t]*\d+\.[ \t]+/, "")}</li>`).join("")
      processedText = processedText.replace(listMatch[0], `<ol class="article-list">${formattedItems}</ol>`)
    }

    // Handle tables (simple markdown tables)
    const tableRegex = /\|(.+)\|\n\|([-:| ]+)\|\n((?:\|.+\|\n)+)/g
    processedText = processedText.replace(tableRegex, (match, headerRow, separatorRow, bodyRows) => {
      const headers = headerRow
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean)
      const headerCells = headers.map((header) => `<th>${header}</th>`).join("")

      const rows = bodyRows.trim().split("\n")
      const bodyCells = rows
        .map((row, index) => {
          const cells = row
            .split("|")
            .map((cell) => cell.trim())
            .filter(Boolean)
          return `<tr class="${index % 2 === 0 ? "even-row" : "odd-row"}">${cells.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
        })
        .join("")

      return `<div class="table-container"><table class="article-table"><thead><tr>${headerCells}</tr></thead><tbody>${bodyCells}</tbody></table></div>`
    })

    // Wrap the entire content in an article tag with a custom class
    return `<article class="article-content content-sections">${processedText}</article>`
  }

  // Update the renderMessageParts function to use the article structure
  // Replace the existing renderMessageParts function with this improved version:

  const renderMessageParts = () => {
    return messageParts.map((part, index) => {
      if (part.type === "text") {
        return (
          <div
            key={index}
            className="message-article"
            dangerouslySetInnerHTML={{ __html: renderTextWithHTML(part.content) }}
          />
        )
      } else if (part.type === "code") {
        return (
          <div key={index} className="code-block-container">
            <CodeBlock language={part.language} code={part.content} />
          </div>
        )
      }
      return null
    })
  }

  // Trigger highlight.js manually after rendering
  useEffect(() => {
    if (typeof window !== "undefined" && window.hljs) {
      setTimeout(() => {
        window.hljs.highlightAll()
      }, 200)
    }
  }, [content])

  return <div className="message-content">{renderMessageParts()}</div>
}
