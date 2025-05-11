"use client"

import { useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { usePages } from "@/components/pages-provider"
import { FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

export default function PagesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { rootPages, isLoading: pagesLoading, createPage } = usePages()
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handleCreatePage = async () => {
    const newPage = await createPage(t("pages.untitled"))
    if (newPage) {
      router.push(`/pages/${newPage.id}`)
    }
  }

  const handlePageClick = (pageId: string) => {
    router.push(`/pages/${pageId}`)
  }

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
          <p className="mt-4 text-white">{t("pages.loading")}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="flex h-screen flex-col bg-[#0f0f10] text-white">
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 text-3xl font-bold">{t("pages.title")}</h1>

            <div className="mb-6">
              <Button
                size="sm"
                onClick={handleCreatePage}
                className="bg-[#141415] text-white border border-[#ffffff1f] hover:bg-[#1a1a1a] hover:text-white text-xs"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("pages.new")}
              </Button>
            </div>

            {pagesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
                <p className="ml-4 text-white">{t("pages.loading")}</p>
              </div>
            ) : rootPages.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rootPages.map((page) => (
                  <div
                    key={page.id}
                    className="cursor-pointer rounded-lg border border-[#333] bg-[#1a1a1a] p-4 transition-all hover:border-indigo-500"
                    onClick={() => handlePageClick(page.id)}
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-900/30">
                      <FileText className="h-5 w-5 text-indigo-400" />
                    </div>
                    <h3 className="mb-1 font-medium text-white">{page.title}</h3>
                    <p className="text-sm text-gray-400">{new Date(page.updated_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#333] bg-[#0f0f10] p-12 text-center">
                <FileText className="mb-4 h-12 w-12 text-gray-500" />
                <h3 className="mb-2 text-xl font-medium text-white">{t("pages.noPages")}</h3>
                <p className="mb-6 text-gray-400">{t("pages.createFirstPage")}</p>
                <Button
                  size="sm"
                  onClick={handleCreatePage}
                  className="bg-[#141415] text-white border border-[#ffffff1f] hover:bg-[#1a1a1a] hover:text-white text-xs"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("pages.create")}
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
