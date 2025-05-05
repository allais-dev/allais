"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/auth-provider"
import { debugLog } from "@/utils/debug-logger"
import { useSubscription } from "@/components/subscription-provider"
import { toast } from "@/components/ui/use-toast"

export type Page = {
  id: string
  title: string
  content: string | null
  blocks?: any[]
  icon: string | null
  parent_id: string | null
  is_archived: boolean
  created_at: string
  updated_at: string
  user_id: string
}

type PagesContextType = {
  pages: Page[]
  rootPages: Page[]
  isLoading: boolean
  currentPage: Page | null
  setCurrentPage: (page: Page | null) => void
  createPage: (title: string, parentId?: string | null) => Promise<Page | null>
  updatePage: (id: string, data: Partial<Page>) => Promise<boolean>
  deletePage: (id: string) => Promise<boolean>
  refreshPages: () => Promise<void>
}

const PagesContext = createContext<PagesContextType>({
  pages: [],
  rootPages: [],
  isLoading: true,
  currentPage: null,
  setCurrentPage: () => {},
  createPage: async () => null,
  updatePage: async () => false,
  deletePage: async () => false,
  refreshPages: async () => {},
})

export const usePages = () => useContext(PagesContext)

export function PagesProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<Page[]>([])
  const [rootPages, setRootPages] = useState<Page[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<Page | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const pagesCache = useRef<Map<string, Page>>(new Map())
  const pendingUpdates = useRef<Map<string, Partial<Page>>>(new Map())
  const initialLoadComplete = useRef(false)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { getFeatureLimit } = useSubscription()

  // Improve the fetchPages function to better handle blocks data

  const fetchPages = useCallback(
    async (forceRefresh = false) => {
      if (!user) {
        setPages([])
        setRootPages([])
        setIsLoading(false)
        return
      }

      // Only set loading state if we don't have any pages yet or if forced refresh
      if (pages.length === 0 || forceRefresh) {
        setIsLoading(true)
      }

      try {
        // Add retry logic with exponential backoff
        let retryCount = 0
        const maxRetries = 3
        let delay = 500 // Start with 500ms delay
        let success = false

        while (retryCount <= maxRetries && !success) {
          try {
            // Add a delay before retrying (skip on first attempt)
            if (retryCount > 0) {
              console.log(`Retry attempt ${retryCount} for pages, waiting ${delay}ms...`)
              await new Promise((resolve) => setTimeout(resolve, delay))
            }

            // IMPORTANT: Make sure we're filtering by user_id
            const { data, error } = await supabase
              .from("pages")
              .select("*")
              .eq("user_id", user.id) // This ensures we only get pages for the current user
              .eq("is_archived", false)
              .order("updated_at", { ascending: false })

            if (error) {
              // If we hit a rate limit or other error
              console.error(`Error fetching pages (attempt ${retryCount + 1}):`, error)
              retryCount++

              if (retryCount <= maxRetries) {
                delay *= 2 // Exponential backoff
                continue
              } else {
                // If we've exhausted retries, use existing data
                console.log("Max retries reached, using existing data")
                return
              }
            }

            // Process the data to ensure blocks are properly parsed
            const processedData = data?.map((page) => {
              // Ensure blocks is properly parsed as an array
              if (page.blocks) {
                try {
                  // If blocks is a string, parse it
                  if (typeof page.blocks === "string") {
                    page.blocks = JSON.parse(page.blocks)
                    console.log(`Parsed blocks for page ${page.id}:`, page.blocks)
                  }

                  // Ensure blocks is an array
                  if (!Array.isArray(page.blocks)) {
                    console.warn(`Blocks for page ${page.id} is not an array, resetting to empty array`)
                    page.blocks = []
                  }
                } catch (e) {
                  console.error(`Error parsing blocks for page ${page.id}:`, e)
                  page.blocks = []
                }
              } else {
                // Initialize blocks as an empty array if it doesn't exist
                page.blocks = []
              }

              return page
            })

            // Update cache
            processedData?.forEach((page) => {
              pagesCache.current.set(page.id, page)
            })

            setPages(processedData || [])

            // Filter root pages (pages with no parent)
            const rootPagesData = processedData?.filter((page) => !page.parent_id) || []
            setRootPages(rootPagesData)

            initialLoadComplete.current = true
            success = true
          } catch (error) {
            console.error(`Unexpected error fetching pages (attempt ${retryCount + 1}):`, error)
            retryCount++

            if (retryCount <= maxRetries) {
              delay *= 2 // Exponential backoff
            }
          }
        }
      } catch (error) {
        console.error("Fatal error fetching pages:", error)
      } finally {
        // Ensure loading state shows for at least 300ms to avoid UI flashing
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
        }

        loadingTimeoutRef.current = setTimeout(() => {
          setIsLoading(false)
          loadingTimeoutRef.current = null
        }, 300)
      }
    },
    [user, supabase, pages.length],
  )

  const refreshPages = useCallback(async () => {
    await fetchPages(true)
  }, [fetchPages])

  // Initial fetch of pages
  useEffect(() => {
    if (user && !initialLoadComplete.current) {
      fetchPages()
    }
  }, [user, fetchPages])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [])

  // Also update the subscription to ensure it's properly filtered
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel(`pages_changes_${user.id}`) // Add user ID to channel name for uniqueness
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pages",
          filter: `user_id=eq.${user.id}`, // Ensure filter is applied
        },
        (payload) => {
          // Verify the payload is for the current user
          debugLog("Pages changed, refreshing...", payload)

          // For inserts and updates, we can update the cache directly
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newPage = payload.new as Page

            // Update the cache
            pagesCache.current.set(newPage.id, newPage)

            // Update the pages state without a full refresh
            setPages((prevPages) => {
              const existingIndex = prevPages.findIndex((p) => p.id === newPage.id)
              if (existingIndex >= 0) {
                // Update existing page
                const updatedPages = [...prevPages]
                updatedPages[existingIndex] = newPage
                return updatedPages
              } else {
                // Add new page
                return [...prevPages, newPage]
              }
            })

            // Update rootPages if needed
            if (!newPage.parent_id) {
              setRootPages((prevRootPages) => {
                const existingIndex = prevRootPages.findIndex((p) => p.id === newPage.id)
                if (existingIndex >= 0) {
                  // Update existing page
                  const updatedRootPages = [...prevRootPages]
                  updatedRootPages[existingIndex] = newPage
                  return updatedRootPages
                } else {
                  // Add new page
                  return [...prevRootPages, newPage]
                }
              })
            } else {
              // If it has a parent, make sure it's not in rootPages
              setRootPages((prevRootPages) => prevRootPages.filter((p) => p.id !== newPage.id))
            }
          } else if (payload.eventType === "DELETE") {
            // For deletes, we need to remove from cache and state
            const deletedPageId = payload.old.id

            // Remove from cache
            pagesCache.current.delete(deletedPageId)

            // Update states
            setPages((prevPages) => prevPages.filter((p) => p.id !== deletedPageId))
            setRootPages((prevRootPages) => prevRootPages.filter((p) => p.id !== deletedPageId))
          } else {
            // For other changes, do a full refresh
            fetchPages(true)
          }
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, supabase, fetchPages])

  // Improve the processPendingUpdates function to better handle errors and logging
  useEffect(() => {
    const processPendingUpdates = async () => {
      if (pendingUpdates.current.size === 0) return

      console.log(`Processing ${pendingUpdates.current.size} pending updates...`)
      const updates = [...pendingUpdates.current.entries()]

      // Clear pending updates
      pendingUpdates.current.clear()

      for (const [pageId, data] of updates) {
        try {
          console.log(`Processing update for page ${pageId}:`, {
            dataKeys: Object.keys(data),
            hasBlocks: !!data.blocks,
            blocksCount: data.blocks ? data.blocks.length : 0,
          })

          // Make sure blocks is properly serialized before sending to Supabase
          const dataToSend = { ...data }
          if (dataToSend.blocks) {
            // Ensure blocks is properly serialized as JSONB for Supabase
            // First stringify then parse to ensure it's a clean object
            const blocksJson = JSON.stringify(dataToSend.blocks)
            dataToSend.blocks = JSON.parse(blocksJson)

            console.log("Serialized blocks:", {
              original: data.blocks,
              stringified: blocksJson,
              parsed: dataToSend.blocks,
            })
          }

          const { error } = await supabase
            .from("pages")
            .update({
              ...dataToSend,
              updated_at: new Date().toISOString(),
            })
            .eq("id", pageId)
            .eq("user_id", user?.id)

          if (error) {
            console.error(`Error processing pending update for page ${pageId}:`, error)
          } else {
            console.log(`Successfully processed pending update for page ${pageId}`)
          }
        } catch (error) {
          console.error(`Error processing pending update for page ${pageId}:`, error)
        }
      }
    }

    const interval = setInterval(processPendingUpdates, 2000)
    return () => clearInterval(interval)
  }, [supabase, user])

  const createPage = async (title: string, parentId: string | null = null) => {
    if (!user) return null

    // Check subscription limits
    const pagesLimit = getFeatureLimit("pages")

    // If not unlimited (-1) and we've reached the limit
    if (pagesLimit !== -1 && pages.length >= pagesLimit) {
      toast({
        title: "Subscription limit reached",
        description: `Your current plan allows a maximum of ${pagesLimit} pages. Please upgrade to create more pages.`,
        variant: "destructive",
      })
      return null
    }

    try {
      const newPage = {
        user_id: user.id,
        title,
        content: "",
        blocks: [{ id: crypto.randomUUID(), type: "text", content: "" }],
        parent_id: parentId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("pages").insert([newPage]).select().single()

      if (error) {
        console.error("Error creating page:", error)
        return null
      }

      // Update local state optimistically
      const updatedPages = [...pages, data]
      setPages(updatedPages)

      if (!data.parent_id) {
        setRootPages([...rootPages, data])
      }

      // Update cache
      pagesCache.current.set(data.id, data)

      return data
    } catch (error) {
      console.error("Error creating page:", error)
      return null
    }
  }

  // Find the updatePage function and replace it with this improved version
  // that properly handles the blocks data serialization

  const updatePage = async (id: string, data: Partial<Page>) => {
    if (!user) return false

    try {
      console.log("updatePage called with:", { id, data })

      // Get the current page from cache or state
      const currentPage = pagesCache.current.get(id) || pages.find((p) => p.id === id)

      if (!currentPage) {
        console.error("Page not found for update:", id)
        return false
      }

      // Prepare the data for update
      const updateData: any = {
        ...data,
        updated_at: new Date().toISOString(),
      }

      // Special handling for blocks data - properly serialize it
      if (updateData.blocks) {
        try {
          // Convert blocks to a clean JSON string
          const blocksString = JSON.stringify(updateData.blocks)
          console.log("Stringified blocks:", blocksString.substring(0, 100) + "...")

          // Parse back to ensure it's a clean object
          updateData.blocks = JSON.parse(blocksString)
        } catch (e) {
          console.error("Error processing blocks data:", e)
          return false
        }
      }

      // For debugging - log request details
      console.log("Update request details:", {
        table: "pages",
        id: id,
        user_id: user.id,
        dataFields: Object.keys(updateData),
      })

      // Regular update for all data
      const { data: responseData, error } = await supabase
        .from("pages")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()

      if (error) {
        console.error("Error updating page in Supabase:", error)
        return false
      }

      console.log("Page updated successfully in Supabase, response:", responseData)

      // Update local state immediately
      const updatedPage = { ...currentPage, ...data, updated_at: new Date().toISOString() }

      // Update cache
      pagesCache.current.set(id, updatedPage as Page)

      // Update pages state
      setPages((prevPages) => prevPages.map((p) => (p.id === id ? (updatedPage as Page) : p)))

      // Update root pages if needed
      if (!updatedPage.parent_id) {
        setRootPages((prevRootPages) => prevRootPages.map((p) => (p.id === id ? (updatedPage as Page) : p)))
      }

      return true
    } catch (error) {
      console.error("Error updating page:", error)
      return false
    }
  }

  const deletePage = async (id: string) => {
    if (!user) return false

    try {
      // Update local state optimistically
      const updatedPages = pages.filter((p) => p.id !== id)
      setPages(updatedPages)

      const updatedRootPages = rootPages.filter((p) => p.id !== id)
      setRootPages(updatedRootPages)

      // Remove from cache
      pagesCache.current.delete(id)

      const { error } = await supabase.from("pages").delete().eq("id", id).eq("user_id", user.id)

      if (error) {
        console.error("Error deleting page:", error)
        // Revert optimistic update on error
        await refreshPages()
        return false
      }

      return true
    } catch (error) {
      console.error("Error deleting page:", error)
      // Revert optimistic update on error
      await refreshPages()
      return false
    }
  }

  return (
    <PagesContext.Provider
      value={{
        pages,
        rootPages,
        isLoading,
        currentPage,
        setCurrentPage,
        createPage,
        updatePage,
        deletePage,
        refreshPages,
      }}
    >
      {children}
    </PagesContext.Provider>
  )
}
