"use client"

import React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { usePages, type Page } from "@/components/pages-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save, ArrowLeft, Check, LayoutTemplate, Plus } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { TextBlock } from "@/components/blocks/text-block"
import { TaskBlock } from "@/components/blocks/task-block"
import { CalendarBlock } from "@/components/blocks/calendar-block"
import { KanbanBlock } from "@/components/blocks/kanban-block"
import { useToast } from "@/components/ui/use-toast"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface PageEditorProps {
  pageId: string
  initialData?: Page | null
}

interface Block {
  id: string
  type: "text" | "tasks" | "calendar" | "kanban"
  content: any
}

// Page templates
const PAGE_TEMPLATES = {
  empty: {
    title: "Empty Page",
    blocks: [
      {
        id: uuidv4(),
        type: "text",
        content: "",
      },
    ],
  },
  meeting: {
    title: "Meeting Notes",
    blocks: [
      {
        id: uuidv4(),
        type: "text",
        content: "# Meeting Notes\n\n## Attendees\n\n- \n\n## Agenda\n\n- ",
      },
      {
        id: uuidv4(),
        type: "tasks",
        content: [
          { id: uuidv4(), text: "Action item 1", completed: false },
          { id: uuidv4(), text: "Action item 2", completed: false },
        ],
      },
    ],
  },
  project: {
    title: "Project Plan",
    blocks: [
      {
        id: uuidv4(),
        type: "text",
        content: "# Project Plan\n\n## Objective\n\n\n## Timeline\n\n",
      },
      {
        id: uuidv4(),
        type: "tasks",
        content: [
          { id: uuidv4(), text: "Define project scope", completed: false },
          { id: uuidv4(), text: "Create timeline", completed: false },
          { id: uuidv4(), text: "Assign resources", completed: false },
        ],
      },
      {
        id: uuidv4(),
        type: "kanban",
        content: {
          columns: [
            { id: uuidv4(), title: "To Do" },
            { id: uuidv4(), title: "In Progress" },
            { id: uuidv4(), title: "Done" },
          ],
          cards: [],
        },
      },
    ],
  },
  weekly: {
    title: "Weekly Planner",
    blocks: [
      {
        id: uuidv4(),
        type: "text",
        content: "# Weekly Planner\n\n## Goals for the week\n\n- \n\n## Notes\n\n",
      },
      {
        id: uuidv4(),
        type: "calendar",
        content: [],
      },
      {
        id: uuidv4(),
        type: "tasks",
        content: [
          { id: uuidv4(), text: "Monday", completed: false },
          { id: uuidv4(), text: "Tuesday", completed: false },
          { id: uuidv4(), text: "Wednesday", completed: false },
          { id: uuidv4(), text: "Thursday", completed: false },
          { id: uuidv4(), text: "Friday", completed: false },
        ],
      },
    ],
  },
}

export function PageEditor({ pageId, initialData }: PageEditorProps) {
  console.log("PageEditor: Rendering with pageId:", pageId, "initialData:", initialData)

  const { pages, updatePage, isLoading: pagesIsLoading } = usePages()
  const [page, setPage] = useState<Page | null>(initialData || null)
  const [title, setTitle] = useState(initialData?.title || "")
  const [blocks, setBlocks] = useState<Block[]>(processInitialBlocks(initialData?.blocks || []))
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showSavedIndicator, setShowSavedIndicator] = useState(false)
  const [focusedBlockIndex, setFocusedBlockIndex] = useState<number | null>(null)
  const [newBlockId, setNewBlockId] = useState<string | null>(null)
  const router = useRouter() // Fixed: Don't use array destructuring
  const { toast } = useToast()
  const initialLoadRef = useRef(initialData ? true : false)
  const pendingSaveRef = useRef(false)
  const currentPageIdRef = useRef<string | null>(null)
  const directFetchAttemptedRef = useRef(false)
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)

  // Function to process initial blocks data
  function processInitialBlocks(rawBlocks: any[]): Block[] {
    console.log("Processing initial blocks:", rawBlocks)

    if (!rawBlocks || !Array.isArray(rawBlocks) || rawBlocks.length === 0) {
      console.log("No valid blocks found, creating default block")
      return [
        {
          id: uuidv4(),
          type: "text",
          content: "",
        },
      ]
    }

    // Validate each block has required properties
    const validBlocks = rawBlocks.filter((block) => {
      if (!block || typeof block !== "object") {
        console.warn("Invalid block (not an object):", block)
        return false
      }

      if (!block.id || !block.type) {
        console.warn("Block missing required properties:", block)
        return false
      }

      return true
    })

    // If no valid blocks, return default
    if (validBlocks.length === 0) {
      return [
        {
          id: uuidv4(),
          type: "text",
          content: "",
        },
      ]
    }

    // Check if the last block is an empty text block
    const lastBlock = validBlocks[validBlocks.length - 1]
    const hasEmptyLastBlock = lastBlock && lastBlock.type === "text" && lastBlock.content === ""

    // If there's no empty block at the end, add one
    if (!hasEmptyLastBlock) {
      validBlocks.push({
        id: uuidv4(),
        type: "text",
        content: "",
      })
    }

    console.log("Processed blocks:", validBlocks)
    return validBlocks
  }

  // Reset state when pageId changes
  useEffect(() => {
    // Only reset if the pageId has actually changed
    if (currentPageIdRef.current !== pageId) {
      console.log("PageEditor: pageId changed from", currentPageIdRef.current, "to", pageId, "- resetting state")

      // Update the ref
      currentPageIdRef.current = pageId

      // If we have initialData, use it directly
      if (initialData) {
        console.log("Using initialData directly:", initialData)
        setPage(initialData)
        setTitle(initialData.title || "")
        setBlocks(processInitialBlocks(initialData.blocks || []))
        initialLoadRef.current = true
      } else {
        // Reset all state if no initialData
        setPage(null)
        setTitle("")
        setBlocks([])
        setLastSaved(null)
        setShowSavedIndicator(false)
        initialLoadRef.current = false
        directFetchAttemptedRef.current = false
      }
    }
  }, [pageId, initialData])

  // Direct database fetch function
  const fetchPageDirectly = useCallback(async () => {
    if (!user || !pageId) return null

    try {
      console.log("Directly fetching page from database:", pageId)

      // Fetch the page directly from the database
      const { data, error } = await supabase.from("pages").select("*").eq("id", pageId).eq("user_id", user.id).single()

      if (error) {
        console.error("Error fetching page directly:", error)
        return null
      }

      console.log("Direct fetch result:", data)
      directFetchAttemptedRef.current = true
      return data
    } catch (err) {
      console.error("Error in direct fetch:", err)
      return null
    }
  }, [pageId, user, supabase])

  // Process blocks data from any source
  const processBlocksData = useCallback((rawData: any): Block[] => {
    if (!rawData) return []

    let processedBlocks: Block[] = []

    try {
      // Case 1: blocks is already an array
      if (Array.isArray(rawData.blocks)) {
        console.log("Blocks is already an array:", rawData.blocks)
        processedBlocks = rawData.blocks
      }
      // Case 2: blocks is a string (needs parsing)
      else if (typeof rawData.blocks === "string") {
        console.log("Blocks is a string, parsing:", rawData.blocks)
        try {
          processedBlocks = JSON.parse(rawData.blocks)
          if (!Array.isArray(processedBlocks)) {
            console.warn("Parsed blocks is not an array, creating empty array")
            processedBlocks = []
          }
        } catch (e) {
          console.error("Error parsing blocks string:", e)
          processedBlocks = []
        }
      }
      // Case 3: blocks is an object (PostgreSQL JSONB sometimes comes as object)
      else if (typeof rawData.blocks === "object" && rawData.blocks !== null) {
        console.log("Blocks is an object:", rawData.blocks)
        // Try to convert to array if it has numeric keys
        const keys = Object.keys(rawData.blocks)
        if (keys.length > 0 && keys.every((k) => !isNaN(Number(k)))) {
          processedBlocks = Object.values(rawData.blocks)
          console.log("Converted object to array:", processedBlocks)
        } else {
          console.warn("Blocks object doesn't look like an array, creating empty array")
          processedBlocks = []
        }
      }
      // Case 4: fallback to content field
      else if (rawData.content) {
        console.log("Using content field instead of blocks:", rawData.content)
        processedBlocks = [
          {
            id: uuidv4(),
            type: "text",
            content: rawData.content,
          },
        ]
      }

      // Validate each block has required properties
      processedBlocks = processedBlocks.filter((block) => {
        if (!block || typeof block !== "object") {
          console.warn("Invalid block (not an object):", block)
          return false
        }

        if (!block.id || !block.type) {
          console.warn("Block missing required properties:", block)
          return false
        }

        return true
      })

      // Ensure we have at least one block
      if (processedBlocks.length === 0) {
        const newBlockId = uuidv4()
        processedBlocks = [
          {
            id: newBlockId,
            type: "text",
            content: "",
          },
        ]
        setNewBlockId(newBlockId)
        console.log("Created default empty block")
      }

      // Check if the last block is an empty text block
      const lastBlock = processedBlocks[processedBlocks.length - 1]
      const hasEmptyLastBlock = lastBlock && lastBlock.type === "text" && lastBlock.content === ""

      // If there's no empty block at the end, add one
      if (!hasEmptyLastBlock) {
        const emptyBlockId = uuidv4()
        processedBlocks.push({
          id: emptyBlockId,
          type: "text",
          content: "",
        })
        console.log("Added empty block at the end")
      }

      console.log("Final processed blocks:", processedBlocks)
      return processedBlocks
    } catch (err) {
      console.error("Error processing blocks data:", err)
      // Return a default empty block
      return [
        {
          id: uuidv4(),
          type: "text",
          content: "",
        },
      ]
    }
  }, [])

  // Load page data - first try from context, then direct fetch
  useEffect(() => {
    const loadPageData = async () => {
      // Skip if we already have initialData or if we've already loaded the page
      if (initialData || initialLoadRef.current) {
        console.log("Skipping loadPageData - already have initialData or initialLoadRef is true")
        return
      }

      if (!user || !pageId) return

      console.log("Loading page data for:", pageId)

      // Show loading state
      setIsLoading(true)

      // First try to find the page in our context
      const foundPage = pages.find((p) => p.id === pageId && p.user_id === user.id)

      if (foundPage) {
        console.log("Found page in context:", foundPage)

        // Process the page data
        setPage(foundPage)
        setTitle(foundPage.title)

        // Process blocks
        const processedBlocks = processBlocksData(foundPage)
        setBlocks(processedBlocks)

        initialLoadRef.current = true
      } else {
        console.log("Page not found in context, trying direct fetch")

        // Try direct fetch
        const directData = await fetchPageDirectly()

        if (directData) {
          // Process the page data
          setPage(directData)
          setTitle(directData.title)

          // Process blocks
          const processedBlocks = processBlocksData(directData)
          setBlocks(processedBlocks)

          initialLoadRef.current = true
        } else {
          console.error("Page not found in direct fetch either")
        }
      }

      // Hide loading state
      setIsLoading(false)
    }

    loadPageData()
  }, [pageId, pages, user, fetchPageDirectly, processBlocksData, initialData])

  // Background save functionality
  const savePageData = useCallback(async () => {
    if (!page) return false

    console.log("Saving page data:", {
      pageId: page.id,
      title,
      blocksCount: blocks.length,
    })

    try {
      setIsSaving(true)
      pendingSaveRef.current = true

      // Convert blocks to a proper JSON string before saving
      const blocksToSave = JSON.parse(JSON.stringify(blocks))

      // Try to save with more detailed error handling
      const result = await updatePage(page.id, {
        title,
        blocks: blocksToSave,
        content: blocks
          .filter((b) => b.type === "text")
          .map((b) => b.content)
          .join("\n\n"), // For backward compatibility
      })

      if (result) {
        // Update last saved time
        const now = new Date()
        setLastSaved(now)

        // Show saved indicator briefly
        setShowSavedIndicator(true)
        setTimeout(() => setShowSavedIndicator(false), 2000)

        // Update the local page state to reflect the saved changes
        setPage((prevPage) => {
          if (!prevPage) return null
          return {
            ...prevPage,
            title,
            blocks: blocksToSave,
            updated_at: new Date().toISOString(),
          }
        })

        toast({
          title: "Changes saved",
          description: "Your changes have been saved successfully.",
        })

        return true
      } else {
        console.error("Save failed - updatePage returned false")
        toast({
          title: "Failed to save",
          description: "Your changes couldn't be saved. Please try again.",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Error saving page:", error)
      toast({
        title: "Error saving",
        description: "An error occurred while saving. Check the console for details.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsSaving(false)
      pendingSaveRef.current = false
    }
  }, [page, title, blocks, updatePage, toast])

  // Save before unloading
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingSaveRef.current) {
        e.preventDefault()
        e.returnValue = ""
        return ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  const handleManualSave = async () => {
    if (isSaving) return
    const success = await savePageData()

    if (success) {
      // Force a refresh of the page data from the database
      console.log("Save successful, updating UI with new data")

      // Optionally refresh data from database
      await fetchPageDirectly()
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleBackClick = () => {
    router.push("/pages")
  }

  const handleAddBlock = useCallback((type: string, afterBlockId?: string) => {
    const newBlock: Block = {
      id: uuidv4(),
      type: type as "text" | "tasks" | "calendar" | "kanban",
      content: getDefaultContentForType(type),
    }

    // Set the new block ID so we can focus it
    setNewBlockId(newBlock.id)

    setBlocks((prevBlocks) => {
      // If afterBlockId is provided, add after that specific block
      if (afterBlockId) {
        const blockIndex = prevBlocks.findIndex((block) => block.id === afterBlockId)
        if (blockIndex !== -1) {
          const updatedBlocks = [...prevBlocks.slice(0, blockIndex + 1), newBlock, ...prevBlocks.slice(blockIndex + 1)]
          setFocusedBlockIndex(blockIndex + 1)
          return updatedBlocks
        }
      }

      // Check if the last block is an empty text block
      const lastBlock = prevBlocks[prevBlocks.length - 1]
      const isLastBlockEmpty = lastBlock && lastBlock.type === "text" && lastBlock.content === ""

      if (isLastBlockEmpty) {
        // Insert the new block before the empty block
        const updatedBlocks = [...prevBlocks.slice(0, prevBlocks.length - 1), newBlock, lastBlock]
        setFocusedBlockIndex(prevBlocks.length - 1)
        return updatedBlocks
      } else {
        // If there's no empty block at the end, add the new block
        // and then add an empty text block
        const emptyBlock: Block = {
          id: uuidv4(),
          type: "text",
          content: "",
        }
        return [...prevBlocks, newBlock, emptyBlock]
      }
    })
  }, [])

  const getDefaultContentForType = (type: string) => {
    switch (type) {
      case "text":
        return ""
      case "tasks":
        return []
      case "calendar":
        return []
      case "kanban":
        return {
          columns: [
            { id: uuidv4(), title: "To Do" },
            { id: uuidv4(), title: "In Progress" },
            { id: uuidv4(), title: "Done" },
          ],
          cards: [],
        }
      default:
        return ""
    }
  }

  const handleUpdateBlock = (id: string, content: any) => {
    setBlocks((prevBlocks) => prevBlocks.map((block) => (block.id === id ? { ...block, content } : block)))
  }

  const handleDeleteBlock = (id: string) => {
    setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id))
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(blocks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Check if the last block is an empty text block
    const lastBlock = items[items.length - 1]
    const isLastBlockEmpty = lastBlock && lastBlock.type === "text" && lastBlock.content === ""

    // If the last block is not an empty text block, add one
    if (!isLastBlockEmpty) {
      const emptyBlock: Block = {
        id: uuidv4(),
        type: "text",
        content: "",
      }
      items.push(emptyBlock)
    }

    setBlocks(items)
  }

  const applyTemplate = (templateKey: keyof typeof PAGE_TEMPLATES) => {
    const template = PAGE_TEMPLATES[templateKey]

    // Generate new IDs for all blocks to ensure uniqueness
    const newBlocks = template.blocks.map((block) => ({
      ...block,
      id: uuidv4(),
    }))

    // Check if the last block is an empty text block
    const lastBlock = newBlocks[newBlocks.length - 1]
    const hasEmptyLastBlock = lastBlock && lastBlock.type === "text" && lastBlock.content === ""

    // If there's no empty block at the end, add one
    if (!hasEmptyLastBlock) {
      const emptyBlockId = uuidv4()
      newBlocks.push({
        id: emptyBlockId,
        type: "text",
        content: "",
      })
    }

    setTitle(template.title)
    setBlocks(newBlocks)

    toast({
      title: "Template Applied",
      description: `Applied the ${template.title} template to your page.`,
    })
  }

  const renderBlock = (block: Block, index: number) => {
    const isLastBlock = index === blocks.length - 1
    const shouldAutoFocus = block.id === newBlockId

    // If this block was just created and should be focused, clear the newBlockId
    if (shouldAutoFocus) {
      // Clear the newBlockId after a short delay to ensure the component has rendered
      setTimeout(() => {
        setNewBlockId(null)
      }, 100)
    }

    switch (block.type) {
      case "text":
        return (
          <TextBlock
            key={block.id}
            id={block.id}
            content={block.content}
            onChange={handleUpdateBlock}
            onDelete={handleDeleteBlock}
            onFocus={() => setFocusedBlockIndex(index)}
            onAddBlock={handleAddBlock}
            isLast={isLastBlock}
            index={index}
            autoFocus={shouldAutoFocus}
          />
        )
      case "tasks":
        return (
          <TaskBlock
            key={block.id}
            id={block.id}
            tasks={block.content}
            onChange={handleUpdateBlock}
            onDelete={handleDeleteBlock}
            onFocus={() => setFocusedBlockIndex(index)}
          />
        )
      case "calendar":
        return (
          <CalendarBlock
            key={block.id}
            id={block.id}
            events={block.content}
            onChange={handleUpdateBlock}
            onDelete={handleDeleteBlock}
            onFocus={() => setFocusedBlockIndex(index)}
          />
        )
      case "kanban":
        return (
          <KanbanBlock
            key={block.id}
            id={block.id}
            columns={block.content.columns}
            cards={block.content.cards}
            onChange={handleUpdateBlock}
            onDelete={handleDeleteBlock}
            onFocus={() => setFocusedBlockIndex(index)}
          />
        )
      default:
        return null
    }
  }

  // If there are no blocks, add an empty text block
  useEffect(() => {
    if (initialLoadRef.current && blocks.length === 0) {
      const newBlockId = uuidv4()
      setBlocks([
        {
          id: newBlockId,
          type: "text",
          content: "",
        },
      ])
      setNewBlockId(newBlockId)
    }
  }, [blocks.length, initialLoadRef.current])

  if (isLoading || (pagesIsLoading && !initialLoadRef.current)) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading page...</p>
        </div>
      </div>
    )
  }

  if (!page && initialLoadRef.current) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-gray-400">Page not found</p>
        <Button
          variant="outline"
          className="mt-4 border-[#333] bg-transparent hover:bg-[#1a1a1a]"
          onClick={handleBackClick}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pages
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[#ffffff1f] bg-[#141415] text-white hover:bg-[#1a1a1a] hover:text-white"
            onClick={handleBackClick}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-[#ffffff1f] bg-[#141415] text-white hover:bg-[#1a1a1a] hover:text-white"
              >
                <LayoutTemplate className="mr-2 h-4 w-4" />
                Templates
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1a1a1a] border-[#333] text-white">
              <DropdownMenuItem onClick={() => applyTemplate("empty")} className="cursor-pointer hover:bg-[#333]">
                Empty Page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyTemplate("meeting")} className="cursor-pointer hover:bg-[#333]">
                Meeting Notes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyTemplate("project")} className="cursor-pointer hover:bg-[#333]">
                Project Plan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyTemplate("weekly")} className="cursor-pointer hover:bg-[#333]">
                Weekly Planner
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            className="border-[#ffffff1f] bg-[#141415] text-white hover:bg-[#1a1a1a] hover:text-white"
            onClick={() => handleAddBlock("text")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Block
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {showSavedIndicator && (
            <div className="flex items-center text-xs text-green-400">
              <Check className="mr-1 h-3 w-3" />
              Saved
            </div>
          )}

          {lastSaved && !showSavedIndicator && (
            <div className="text-xs text-gray-400">
              Last saved: {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="border-[#ffffff1f] bg-[#141415] text-white hover:bg-[#1a1a1a] hover:text-white"
            onClick={handleManualSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      <Input
        value={title}
        onChange={handleTitleChange}
        placeholder="Untitled"
        className="mb-4 border-none bg-transparent px-0 text-2xl font-bold focus-visible:ring-0"
      />

      <div className="flex-1 overflow-y-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="blocks">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {blocks.map((block, index) => (
                  <Draggable key={block.id} draggableId={block.id} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} className="relative mb-1">
                        {React.cloneElement(renderBlock(block, index) as React.ReactElement, {
                          dragHandleProps: provided.dragHandleProps,
                        })}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {blocks.length === 0 && (
          <div className="mt-4 text-center text-gray-400">
            <p>This page is empty. Type / to add content.</p>
          </div>
        )}
      </div>
    </div>
  )
}
