"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { PageEditor } from "@/components/page-editor"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function PageDetailPage({ params }: { params: { id: string } }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pageId = params.id
  const [pageExists, setPageExists] = useState<boolean | null>(null)
  const [checkingPage, setCheckingPage] = useState(true)
  const [pageData, setPageData] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Verify that the page belongs to the current user
  useEffect(() => {
    const verifyPageOwnership = async () => {
      if (!user || !pageId) return

      setCheckingPage(true)
      try {
        console.log("Verifying page ownership for:", pageId)

        // Change this to select all fields, not just id
        const { data, error } = await supabase
          .from("pages")
          .select("*") // Select all fields instead of just id
          .eq("id", pageId)
          .eq("user_id", user.id)
          .single()

        if (error || !data) {
          console.error("Page not found or doesn't belong to current user:", error)
          setPageExists(false)
        } else {
          console.log("Page found:", data)
          console.log("Blocks data:", data.blocks)

          // Ensure blocks is properly processed
          if (data.blocks) {
            // If blocks is a string, parse it
            if (typeof data.blocks === "string") {
              try {
                data.blocks = JSON.parse(data.blocks)
              } catch (e) {
                console.error("Error parsing blocks string:", e)
                data.blocks = []
              }
            }

            // Ensure blocks is an array
            if (!Array.isArray(data.blocks)) {
              console.warn("Blocks is not an array, resetting to empty array")
              data.blocks = []
            }
          } else {
            // Initialize blocks as an empty array if it doesn't exist
            data.blocks = []
          }

          setPageData(data)
          setPageExists(true)
        }
      } catch (error) {
        console.error("Error verifying page ownership:", error)
        setPageExists(false)
      } finally {
        // Add a small delay before hiding the loading state to prevent flashing
        setTimeout(() => {
          setCheckingPage(false)
        }, 300)
      }
    }

    verifyPageOwnership()
  }, [pageId, user, supabase])

  // Log when the page ID changes
  useEffect(() => {
    console.log("PageDetailPage: Rendering with pageId:", pageId)
  }, [pageId])

  if (isLoading || checkingPage) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
          <p className="mt-4 text-white">Loading page content...</p>
          <p className="text-xs text-gray-500 mt-2">This may take a moment</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  if (pageExists === false) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-gray-400 mb-6">This page doesn't exist or you don't have permission to view it.</p>
          <button
            onClick={() => router.push("/pages")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Pages
          </button>
        </div>
      </div>
    )
  }

  // Display debug info about the page data
  if (pageData && pageExists) {
    console.log("Page data before rendering PageEditor:", {
      id: pageData.id,
      title: pageData.title,
      blocksType: typeof pageData.blocks,
      blocksIsArray: Array.isArray(pageData.blocks),
      blocksLength: pageData.blocks ? (Array.isArray(pageData.blocks) ? pageData.blocks.length : "not array") : "null",
      blocks: pageData.blocks,
    })
  }

  // Using a unique key based on pageId forces a complete remount of the PageEditor
  // This ensures that when the page ID changes, the editor is completely recreated
  return <PageEditor key={`page-${pageId}`} pageId={pageId} initialData={pageData} />
}
