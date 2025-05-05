"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Type, CheckSquare, Calendar, Trello } from "lucide-react"

interface SlashCommandOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  type: string
}

interface SlashCommandMenuProps {
  isOpen: boolean
  onSelect: (type: string) => void
  onClose: () => void
  position: { top: number; left: number }
}

export function SlashCommandMenu({ isOpen, onSelect, onClose, position }: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const options: SlashCommandOption[] = [
    {
      id: "text",
      name: "Text",
      description: "Just start writing with plain text",
      icon: <Type className="h-4 w-4" />,
      type: "text",
    },
    {
      id: "tasks",
      name: "To-do List",
      description: "Track tasks with a to-do list",
      icon: <CheckSquare className="h-4 w-4" />,
      type: "tasks",
    },
    {
      id: "calendar",
      name: "Calendar",
      description: "Add a calendar to track events",
      icon: <Calendar className="h-4 w-4" />,
      type: "calendar",
    },
    {
      id: "kanban",
      name: "Kanban Board",
      description: "Add a kanban board for project management",
      icon: <Trello className="h-4 w-4" />,
      type: "kanban",
    },
  ]

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()

      switch (e.key) {
        case "ArrowDown":
          setSelectedIndex((prevIndex) => (prevIndex + 1) % options.length)
          break
        case "ArrowUp":
          setSelectedIndex((prevIndex) => (prevIndex - 1 + options.length) % options.length)
          break
        case "Enter":
          onSelect(options[selectedIndex].type)
          break
        case "Escape":
          onClose()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, selectedIndex, options, onSelect, onClose])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] w-64 rounded-md border border-[#333] bg-[#1a1a1a] p-1 shadow-lg"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="mb-1 px-2 py-1 text-xs text-gray-400">Add blocks</div>
      <div className="max-h-60 overflow-y-auto">
        {options.map((option, index) => (
          <div
            key={option.id}
            className={`flex cursor-pointer items-start rounded-md px-2 py-1.5 ${
              selectedIndex === index ? "bg-[#333] text-white" : "text-gray-300 hover:bg-[#252525]"
            }`}
            onClick={() => onSelect(option.type)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="mr-2 mt-0.5 text-gray-400">{option.icon}</div>
            <div>
              <div className="text-sm font-medium">{option.name}</div>
              <div className="text-xs text-gray-400">{option.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
