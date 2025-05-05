"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Plus, FileText, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePages } from "@/components/pages-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"

export function PagesSidebar({ isCollapsed = false }) {
  const { rootPages, isLoading, createPage, deletePage } = usePages()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState("")
  const router = useRouter()
  const pathname = usePathname()
  const [currentPath, setCurrentPath] = useState(pathname)
  const { toast } = useToast()
  const { user } = useAuth()

  // Update current path when pathname changes
  useEffect(() => {
    setCurrentPath(pathname)
  }, [pathname])

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) return

    const newPage = await createPage(newPageTitle)
    if (newPage) {
      setNewPageTitle("")
      setIsCreateDialogOpen(false)

      // Use replace instead of push to avoid history stacking issues
      router.replace(`/pages/${newPage.id}`)
    }
  }

  const handlePageClick = (pageId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Log the navigation attempt
    console.log("PagesSidebar: Navigating to page:", pageId, "from current path:", pathname)

    // Use router.push instead of replace to maintain history
    router.push(`/pages/${pageId}`)
  }

  const handleDeletePage = async (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (confirm("Are you sure you want to delete this page?")) {
      const success = await deletePage(pageId)
      if (success) {
        toast({
          title: "Page deleted",
          description: "The page has been successfully deleted.",
        })

        // If we're currently on this page, navigate back to pages list
        if (pathname.includes(pageId)) {
          router.replace("/pages")
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the page. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  if (isCollapsed) {
    return null
  }

  return (
    <>
      <div className="mt-4 px-4 py-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">PAGES</h2>
          <button
            className="rounded p-1 transition-colors duration-200 hover:bg-[#1a1a1a]"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="px-3 py-2 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"></div>
            <span className="ml-2 text-xs text-gray-500">Loading pages...</span>
          </div>
        ) : rootPages.length > 0 ? (
          rootPages.map((page) => (
            <div key={page.id} className="flex items-center group">
              <div
                className={`flex-1 flex items-center rounded-md px-2 py-1.5 text-sm ${
                  pathname.includes(page.id)
                    ? "bg-[#1a1a1a] text-white"
                    : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
                } cursor-pointer`}
                onClick={(e) => handlePageClick(page.id, e)}
              >
                <FileText className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                <span className="truncate">{page.title || "Untitled Page"}</span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleDeletePage(page.id, e)}
                  className="rounded-md p-1 text-gray-500 hover:bg-[#333] hover:text-red-400"
                  title="Delete page"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No pages yet</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-xs border-[#333] bg-transparent hover:bg-[#1a1a1a]"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Create a page
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#333] text-white">
          <DialogHeader>
            <DialogTitle>Create new page</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Page title"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              className="bg-[#0f0f10] border-[#333] text-white"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreatePage()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="border-[#333] bg-transparent hover:bg-[#0f0f10] text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePage}
              className="border border-[#333] bg-[#1a1a1a] hover:bg-[#0f0f10] text-xs"
              disabled={!newPageTitle.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
