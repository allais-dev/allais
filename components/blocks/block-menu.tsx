"use client"

import { useState, useRef, useEffect } from "react"
import { Type, CheckSquare, Calendar, Trello, X } from "lucide-react"

interface BlockMenuProps {
  onAddBlock: (type: string) => void
  onClose: () => void
}

export function BlockMenu({ onAddBlock, onClose }: BlockMenuProps) {
  const [isOpen, setIsOpen] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  const handleAddBlock = (type: string) => {
    onAddBlock(type)
    setIsOpen(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className="absolute left-1/2 z-10 w-64 -translate-x-1/2 transform rounded-md border border-[#333] bg-[#1a1a1a] p-2 shadow-lg"
    >
      <div className="mb-2 flex items-center justify-between border-b border-[#333] pb-2">
        <div className="text-sm font-medium text-white">Add a block</div>
        <button
          onClick={() => {
            setIsOpen(false)
            onClose()
          }}
          className="rounded-md p-1 text-gray-400 hover:bg-[#333] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-1">
        <button
          onClick={() => handleAddBlock("text")}
          className="flex w-full items-center rounded-md p-2 text-left text-sm text-gray-300 hover:bg-[#333] hover:text-white"
        >
          <Type className="mr-2 h-4 w-4" />
          Text
        </button>
        <button
          onClick={() => handleAddBlock("tasks")}
          className="flex w-full items-center rounded-md p-2 text-left text-sm text-gray-300 hover:bg-[#333] hover:text-white"
        >
          <CheckSquare className="mr-2 h-4 w-4" />
          Tasks
        </button>
        <button
          onClick={() => handleAddBlock("calendar")}
          className="flex w-full items-center rounded-md p-2 text-left text-sm text-gray-300 hover:bg-[#333] hover:text-white"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Calendar
        </button>
        <button
          onClick={() => handleAddBlock("kanban")}
          className="flex w-full items-center rounded-md p-2 text-left text-sm text-gray-300 hover:bg-[#333] hover:text-white"
        >
          <Trello className="mr-2 h-4 w-4" />
          Kanban Board
        </button>
      </div>
    </div>
  )
}
