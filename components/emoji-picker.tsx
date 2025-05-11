"use client"

import { useState } from "react"
import { Smile } from "lucide-react"

// Common emojis for quick access
const commonEmojis = [
  "😊",
  "😂",
  "🙌",
  "👍",
  "👏",
  "🎉",
  "❤️",
  "🔥",
  "✨",
  "🤔",
  "👀",
  "🙏",
  "💯",
  "🚀",
  "👋",
  "😍",
  "🤣",
  "😎",
  "🧐",
  "🤷‍♂️",
  "🤷‍♀️",
  "👌",
  "🙄",
  "😢",
  "😭",
  "😳",
  "😬",
  "🤦‍♂️",
  "🤦‍♀️",
  "👇",
  "👆",
  "💪",
  "🤝",
  "🤓",
  "😴",
  "🥳",
  "😅",
  "😉",
  "🤗",
  "😇",
]

// Emoji categories
const categories = [
  { name: "Smileys", icon: "😊" },
  { name: "People", icon: "👨‍👩‍👧‍👦" },
  { name: "Animals", icon: "🐶" },
  { name: "Food", icon: "🍔" },
  { name: "Activities", icon: "⚽" },
  { name: "Travel", icon: "✈️" },
  { name: "Objects", icon: "💡" },
  { name: "Symbols", icon: "❤️" },
  { name: "Flags", icon: "🏁" },
]

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState("Smileys")

  return (
    <div className="w-64 rounded-md border border-[#333333] bg-[#0f0f10] p-2 shadow-lg z-999">
      {/* Emoji grid */}
      <div className="grid grid-cols-8 gap-1 mb-2">
        {commonEmojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onEmojiSelect(emoji)}
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-800"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex overflow-x-auto pb-1 mb-2 border-t border-[#333333] pt-2">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(category.name)}
            className={`flex items-center justify-center px-2 py-1 text-xs rounded mr-1 ${
              activeCategory === category.name ? "bg-gray-800" : "hover:bg-gray-800"
            }`}
          >
            <span className="mr-1">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Placeholder for category emojis */}
      <div className="text-center text-xs text-gray-400 py-2">
        <Smile className="inline h-4 w-4 mr-1" />
        Click an emoji to insert
      </div>
    </div>
  )
}
