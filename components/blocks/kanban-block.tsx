"use client"

import { useState } from "react"
import { Plus, Trash2, MoreHorizontal, X, GripVertical } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface KanbanCard {
  id: string
  content: string
  columnId: string
}

interface KanbanColumn {
  id: string
  title: string
}

interface KanbanBlockProps {
  id: string
  columns: KanbanColumn[]
  cards: KanbanCard[]
  onChange: (id: string, data: { columns: KanbanColumn[]; cards: KanbanCard[] }) => void
  onDelete: (id: string) => void
  onFocus: () => void
  dragHandleProps?: any
}

export function KanbanBlock({
  id,
  columns: initialColumns,
  cards: initialCards,
  onChange,
  onDelete,
  onFocus,
  dragHandleProps,
}: KanbanBlockProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(
    initialColumns || [
      { id: uuidv4(), title: "To Do" },
      { id: uuidv4(), title: "In Progress" },
      { id: uuidv4(), title: "Done" },
    ],
  )
  const [cards, setCards] = useState<KanbanCard[]>(initialCards || [])
  const [newColumnTitle, setNewColumnTitle] = useState("")
  const [showNewColumnForm, setShowNewColumnForm] = useState(false)
  const [editingCard, setEditingCard] = useState<{ id: string; content: string } | null>(null)

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      const newColumn = { id: uuidv4(), title: newColumnTitle }
      const updatedColumns = [...columns, newColumn]
      setColumns(updatedColumns)
      onChange(id, { columns: updatedColumns, cards })
      setNewColumnTitle("")
      setShowNewColumnForm(false)
    }
  }

  const handleDeleteColumn = (columnId: string) => {
    const updatedColumns = columns.filter((col) => col.id !== columnId)
    const updatedCards = cards.filter((card) => card.columnId !== columnId)
    setColumns(updatedColumns)
    setCards(updatedCards)
    onChange(id, { columns: updatedColumns, cards: updatedCards })
  }

  const handleAddCard = (columnId: string) => {
    const newCard = { id: uuidv4(), content: "", columnId }
    const updatedCards = [...cards, newCard]
    setCards(updatedCards)
    setEditingCard({ id: newCard.id, content: "" })
    onChange(id, { columns, cards: updatedCards })
  }

  const handleCardContentChange = (cardId: string, content: string) => {
    setEditingCard({ id: cardId, content })
  }

  const handleSaveCard = () => {
    if (editingCard && editingCard.content.trim()) {
      const updatedCards = cards.map((card) =>
        card.id === editingCard.id ? { ...card, content: editingCard.content } : card,
      )
      setCards(updatedCards)
      onChange(id, { columns, cards: updatedCards })
    }
    setEditingCard(null)
  }

  const handleDeleteCard = (cardId: string) => {
    const updatedCards = cards.filter((card) => card.id !== cardId)
    setCards(updatedCards)
    onChange(id, { columns, cards: updatedCards })
  }

  const handleMoveCard = (cardId: string, targetColumnId: string) => {
    const updatedCards = cards.map((card) => (card.id === cardId ? { ...card, columnId: targetColumnId } : card))
    setCards(updatedCards)
    onChange(id, { columns, cards: updatedCards })
  }

  return (
    <div className="group relative mb-4 flex items-start" onFocus={onFocus}>
      <div
        className="flex-shrink-0 px-1 py-2 opacity-0 group-hover:opacity-100 cursor-grab transition-opacity"
        {...dragHandleProps}
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <div className="flex-grow rounded-md bg-[#1a1a1a] p-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-300">Kanban Board</div>
          <button
            onClick={() => onDelete(id)}
            className="hidden rounded-md p-1 text-gray-400 hover:bg-[#333] hover:text-red-400 group-hover:block"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex space-x-3 overflow-x-auto pb-2">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-64 rounded-md bg-[#0f0f10] p-2">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-medium text-white">{column.title}</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded p-1 text-gray-400 hover:bg-[#333] hover:text-white">
                      <MoreHorizontal className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-[#333] text-white">
                    <DropdownMenuItem
                      className="hover:bg-[#333] text-red-400 cursor-pointer"
                      onClick={() => handleDeleteColumn(column.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete Column
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                {cards
                  .filter((card) => card.columnId === column.id)
                  .map((card) => (
                    <div key={card.id} className="rounded-md bg-[#1a1a1a] p-2">
                      {editingCard && editingCard.id === card.id ? (
                        <div>
                          <textarea
                            value={editingCard.content}
                            onChange={(e) => handleCardContentChange(card.id, e.target.value)}
                            className="mb-2 w-full resize-none rounded-md bg-[#333] p-2 text-xs text-white outline-none"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setEditingCard(null)}
                              className="rounded-md px-2 py-1 text-xs text-gray-400 hover:bg-[#333] hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveCard}
                              className="rounded-md bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="group/card">
                          <div className="text-xs text-white">{card.content}</div>
                          <div className="mt-2 hidden justify-end space-x-1 group-hover/card:flex">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="rounded p-1 text-gray-400 hover:bg-[#333] hover:text-white">
                                  <MoreHorizontal className="h-3 w-3" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-[#333] text-white">
                                <DropdownMenuItem
                                  className="hover:bg-[#333] cursor-pointer"
                                  onClick={() => setEditingCard({ id: card.id, content: card.content })}
                                >
                                  Edit
                                </DropdownMenuItem>
                                {columns.map(
                                  (col) =>
                                    col.id !== card.columnId && (
                                      <DropdownMenuItem
                                        key={col.id}
                                        className="hover:bg-[#333] cursor-pointer"
                                        onClick={() => handleMoveCard(card.id, col.id)}
                                      >
                                        Move to {col.title}
                                      </DropdownMenuItem>
                                    ),
                                )}
                                <DropdownMenuItem
                                  className="hover:bg-[#333] text-red-400 cursor-pointer"
                                  onClick={() => handleDeleteCard(card.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                <button
                  onClick={() => handleAddCard(column.id)}
                  className="flex w-full items-center justify-center rounded-md bg-[#1a1a1a] p-2 text-xs text-gray-400 hover:bg-[#333] hover:text-white"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Card
                </button>
              </div>
            </div>
          ))}

          {showNewColumnForm ? (
            <div className="flex-shrink-0 w-64 rounded-md bg-[#0f0f10] p-2">
              <input
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Column title"
                className="mb-2 w-full rounded-md bg-[#1a1a1a] p-2 text-xs text-white outline-none"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowNewColumnForm(false)}
                  className="rounded-md px-2 py-1 text-xs text-gray-400 hover:bg-[#333] hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
                <button
                  onClick={handleAddColumn}
                  className="rounded-md bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700"
                  disabled={!newColumnTitle.trim()}
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewColumnForm(true)}
              className="flex-shrink-0 flex h-10 w-64 items-center justify-center rounded-md bg-[#0f0f10] text-xs text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Column
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
