"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Trash2, GripVertical } from "lucide-react"
import { SlashCommandMenu } from "./slash-command-menu"

interface TextBlockProps {
  id: string
  content: string
  onChange: (id: string, content: string) => void
  onDelete: (id: string) => void
  onFocus: () => void
  onAddBlock: (type: string, blockId?: string) => void
  isLast?: boolean
  index: number
  dragHandleProps?: any
  autoFocus?: boolean
}

export function TextBlock({
  id,
  content,
  onChange,
  onDelete,
  onFocus,
  onAddBlock,
  isLast = false,
  index,
  dragHandleProps,
  autoFocus = false,
}: TextBlockProps) {
  const [value, setValue] = useState(content)
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [selectionStart, setSelectionStart] = useState(0)

  // Auto-resize textarea when content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  // Auto-focus when the autoFocus prop is true
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    onChange(id, newValue)

    // Check for slash command
    const cursorPosition = e.target.selectionStart
    setSelectionStart(cursorPosition)

    // If the user just typed a slash, show the menu
    if (
      newValue.charAt(cursorPosition - 1) === "/" &&
      (cursorPosition === 1 || newValue.charAt(cursorPosition - 2) === "\n")
    ) {
      // Position the menu under the active block
      if (textareaRef.current) {
        const textAreaRect = textareaRef.current.getBoundingClientRect()
        setSlashMenuPosition({
          top: textAreaRect.bottom + 5, // 5px below the bottom of the textarea
          left: textAreaRect.left, // Aligned with the left edge of the textarea
        })
      }

      setShowSlashMenu(true)
    } else if (showSlashMenu) {
      // If the user is typing and the menu is open, check if they're still in a slash command
      const textBeforeCursor = newValue.substring(0, cursorPosition)
      const lastNewLineIndex = textBeforeCursor.lastIndexOf("\n")
      const currentLineText = textBeforeCursor.substring(lastNewLineIndex + 1)

      if (!currentLineText.startsWith("/")) {
        setShowSlashMenu(false)
      }
    }

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If slash menu is open, prevent default behavior for arrow keys and enter
    if (showSlashMenu && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) {
      e.preventDefault()
      return
    }

    // If Enter is pressed at the end of the text, add a new block
    if (e.key === "Enter" && !e.shiftKey) {
      const cursorPosition = textareaRef.current?.selectionStart || 0
      const textLength = value.length

      if (cursorPosition === textLength) {
        e.preventDefault()
        onAddBlock("text") // Add a new text block at the end
      }
    }
  }

  const handleSlashCommand = (type: string) => {
    setShowSlashMenu(false)

    // Remove the slash command from the text
    const textBeforeCursor = value.substring(0, selectionStart)
    const lastNewLineIndex = textBeforeCursor.lastIndexOf("\n")
    const startOfLine = lastNewLineIndex === -1 ? 0 : lastNewLineIndex + 1
    const textAfterCursor = value.substring(selectionStart)

    // Update the text without the slash command
    const newText = value.substring(0, startOfLine) + value.substring(selectionStart)
    setValue(newText)
    onChange(id, newText)

    // Always add the new block at the end
    onAddBlock(type)
  }

  return (
    <div className="group relative mb-2 flex items-start">
      <div
        className="flex-shrink-0 px-1 py-2 opacity-0 group-hover:opacity-100 cursor-grab transition-opacity"
        {...dragHandleProps}
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <div className="flex-grow">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          placeholder="Type '/' for commands..."
          className="w-full resize-none bg-transparent p-2 text-white outline-none focus:bg-[#1a1a1a] rounded-md transition-colors"
          rows={1}
        />
        <button
          onClick={() => onDelete(id)}
          className="absolute right-2 top-2 hidden rounded-md p-1 text-gray-400 hover:bg-[#333] hover:text-white group-hover:block"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {showSlashMenu && (
        <SlashCommandMenu
          isOpen={showSlashMenu}
          onSelect={handleSlashCommand}
          onClose={() => setShowSlashMenu(false)}
          position={slashMenuPosition}
        />
      )}
    </div>
  )
}
