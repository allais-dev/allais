"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { FileText, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "@/components/ui/use-toast"
import { usePages } from "@/components/pages-provider"

interface PagesSidebarProps {
  isCollapsed: boolean
  onCloseMobileSidebar?: () => void
}

type Page = {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export function PagesSidebar({ isCollapsed, onCloseMobileSidebar }: PagesSidebarProps) {
  const [pages, setPages] = useState<Page[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const { user } = useAuth()
  const router = useRouter()
  const { t, dir } = useLanguage()
  const pagesContext = usePages()

  const fetchPages = useCallback(async () => {
    if (!user) return

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("pages")
        .select("id, title, created_at, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching pages:", error)
        setPages([])
        setIsLoading(false)
        return
      }

      setPages(data || [])
    } catch (error) {
      console.error("Unexpected error fetching pages:", error)
      setPages([])
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      fetchPages()
    }
  }, [fetchPages, user])

  // Set up a subscription to refresh pages when they change
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel(`pages_changes_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pages",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          fetchPages()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, supabase, fetchPages])

  const handlePageClick = (pageId: string) => {
    if (onCloseMobileSidebar) {
      onCloseMobileSidebar()
    }
    router.push(`/pages/${pageId}`)
  }

  const handleCreatePage = () => {
    if (onCloseMobileSidebar) {
      onCloseMobileSidebar()
    }
    router.push("/pages")
  }

  const handleDeletePage = async (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation() // Prevent navigation to the page

    if (confirm(t("pages.deleteConfirm"))) {
      setDeletingPageId(pageId)

      try {
        // Use the deletePage function from the pages context if available
        if (pagesContext && pagesContext.deletePage) {
          const success = await pagesContext.deletePage(pageId)

          if (success) {
            toast({
              title: t("pages.deleteSuccess"),
              variant: "default",
            })
            // Refresh the pages list
            fetchPages()
          } else {
            toast({
              title: t("pages.deleteError"),
              variant: "destructive",
            })
          }
        } else {
          // Fallback to direct deletion if context not available
          const { error } = await supabase.from("pages").delete().eq("id", pageId).eq("user_id", user?.id)

          if (error) {
            console.error("Error deleting page:", error)
            toast({
              title: t("pages.deleteError"),
              variant: "destructive",
            })
          } else {
            toast({
              title: t("pages.deleteSuccess"),
              variant: "default",
            })
            // Refresh the pages list
            fetchPages()
          }
        }
      } catch (error) {
        console.error("Unexpected error deleting page:", error)
        toast({
          title: t("pages.deleteError"),
          variant: "destructive",
        })
      } finally {
        setDeletingPageId(null)
      }
    }
  }

  if (isCollapsed) return null

  return (
    <div className="mt-4">
      <div className="px-4 py-2">
        {/* Always use LTR layout for the header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{t("pages.myPages")}</h2>
          <button className="rounded p-1 transition-colors duration-200 hover:bg-[#1a1a1a]" onClick={handleCreatePage}>
            <Plus className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="px-3 py-2 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"></div>
            <span className="ml-2 text-xs text-gray-500">{t("pages.loading")}</span>
          </div>
        ) : pages.length > 0 ? (
          pages.map((page) => (
            <div
              key={page.id}
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-gray-400 transition-colors duration-200 hover:bg-[#1a1a1a] hover:text-white group"
            >
              <button
                className="flex items-center text-left text-sm flex-grow overflow-hidden"
                onClick={() => handlePageClick(page.id)}
              >
                <FileText className="h-3.5 w-3.5 flex-shrink-0 mr-2" />
                <span className="truncate">{page.title || t("pages.untitled")}</span>
              </button>
              <button
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-700 transition-opacity duration-200"
                onClick={(e) => handleDeletePage(e, page.id)}
                aria-label={t("pages.delete")}
                disabled={deletingPageId === page.id}
              >
                {deletingPageId === page.id ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"></div>
                ) : (
                  <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-400" />
                )}
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">{t("pages.noPages")}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-xs border-[#333] bg-transparent hover:bg-[#1a1a1a]"
              onClick={handleCreatePage}
            >
              {t("pages.create")}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
