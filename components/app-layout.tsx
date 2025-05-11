"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Sidebar from "@/components/sidebar"
import { usePathname, useSearchParams } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"
import { useLanguage } from "@/contexts/language-context"
import { ChatProvider } from "@/contexts/chat-context" // Import ChatProvider
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [conversationTitle, setConversationTitle] = useState("New Conversation")
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { dir, language, t } = useLanguage()
  const router = useRouter()
  const { user } = useAuth() // TODO: Replace with actual user authentication check
  const { language: currentLanguage, setLanguage } = useLanguage()

  const handleLanguageChange = (newLanguage: "en" | "ar") => {
    setLanguage(newLanguage)
  }

  // Check if we're on the dashboard page
  const isDashboardPage = pathname === "/dashboard"

  // Extract conversation ID from URL if present
  useEffect(() => {
    const conversationParam = searchParams?.get("conversation")
    if (conversationParam) {
      setCurrentConversationId(conversationParam)
    } else {
      setCurrentConversationId(null)
      setConversationTitle("New Conversation")
    }
  }, [searchParams])

  const handleConversationSelect = (conversationId: string | null, title: string) => {
    setCurrentConversationId(conversationId)
    setConversationTitle(title)
  }

  return (
    <div className="flex h-screen bg-[#141414] text-white overflow-hidden" dir={dir}>
      {/* Sidebar - conditionally shown on mobile */}
      <div
        className={`${
          isMobileSidebarOpen ? "block" : "hidden"
        } md:block fixed inset-0 z-40 md:relative md:inset-auto md:z-auto`}
      >
        <Sidebar
          isOpen={true}
          onConversationSelect={handleConversationSelect}
          currentConversationId={currentConversationId}
          onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile navbar - removed border-b */}
        <div className="md:hidden p-3 flex items-center justify-between">
          {/* Left: Title - made bigger */}
          <div className="flex items-center">
            <span className="text-xl font-semibold">Allais</span>
          </div>

          {/* Center: Get Plus button with icon (only show if user is logged in) */}
          {user && (
            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-[#333] bg-transparent hover:bg-[#1a1a1a] text-white flex items-center gap-1"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.5001 3.44338C12.1907 3.26474 11.8095 3.26474 11.5001 3.44338L4.83984 7.28868C4.53044 7.46731 4.33984 7.79744 4.33984 8.1547V15.8453C4.33984 16.2026 4.53044 16.5327 4.83984 16.7113L11.5001 20.5566C11.8095 20.7353 12.1907 20.7353 12.5001 20.5566L19.1604 16.7113C19.4698 16.5327 19.6604 16.2026 19.6604 15.8453V8.1547C19.6604 7.79744 19.4698 7.46731 19.1604 7.28868L12.5001 3.44338ZM10.5001 1.71133C11.4283 1.17543 12.5719 1.17543 13.5001 1.71133L20.1604 5.55663C21.0886 6.09252 21.6604 7.0829 21.6604 8.1547V15.8453C21.6604 16.9171 21.0886 17.9075 20.1604 18.4434L13.5001 22.2887C12.5719 22.8246 11.4283 22.8246 10.5001 22.2887L3.83984 18.4434C2.91164 17.9075 2.33984 16.9171 2.33984 15.8453V8.1547C2.33984 7.0829 2.91164 6.09252 3.83984 5.55663L10.5001 1.71133Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M9.44133 11.4454L9.92944 9.98105C10.0321 9.67299 10.4679 9.67299 10.5706 9.98105L11.0587 11.4454C11.2941 12.1517 11.8483 12.7059 12.5546 12.9413L14.019 13.4294C14.327 13.5321 14.327 13.9679 14.019 14.0706L12.5546 14.5587C11.8483 14.7941 11.2941 15.3483 11.0587 16.0546L10.5706 17.519C10.4679 17.827 10.0321 17.827 9.92944 17.519L9.44133 16.0546C9.2059 15.3483 8.65167 14.7941 7.94537 14.5587L6.48105 14.0706C6.17298 13.9679 6.17298 13.5321 6.48105 13.4294L7.94537 12.9413C8.65167 12.7059 9.2059 12.1517 9.44133 11.4454Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M14.4946 8.05961L14.7996 7.14441C14.8638 6.95187 15.1362 6.95187 15.2004 7.14441L15.5054 8.05961C15.6526 8.50104 15.999 8.84744 16.4404 8.99458L17.3556 9.29965C17.5481 9.36383 17.5481 9.63617 17.3556 9.70035L16.4404 10.0054C15.999 10.1526 15.6526 10.499 15.5054 10.9404L15.2004 11.8556C15.1362 12.0481 14.8638 12.0481 14.7996 11.8556L14.4946 10.9404C14.3474 10.499 14.001 10.1526 13.5596 10.0054L12.6444 9.70035C12.4519 9.63617 12.4519 9.36383 12.6444 9.29965L13.5596 8.99458C14.001 8.84744 14.3474 8.50104 14.4946 8.05961Z"
                    fill="currentColor"
                  ></path>
                </svg>
                Get Plus
              </Button>
            </div>
          )}

          {/* Right: Login/User controls */}
          <div className="flex items-center gap-2">
            {!user ? (
              <>
                {/* For logged out users: Language selector first, then login button */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 text-sm bg-[#141415] rounded-md border border-[#333333]">
                    <Globe className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black border-[#333333] text-white">
                    <DropdownMenuItem
                      className="hover:bg-[#252525] cursor-pointer"
                      onClick={() => handleLanguageChange("en")}
                    >
                      {currentLanguage === "en" ? "English" : "الإنجليزية"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="hover:bg-[#252525] cursor-pointer"
                      onClick={() => handleLanguageChange("ar")}
                    >
                      {currentLanguage === "en" ? "Arabic" : "العربية"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-[#333] bg-transparent hover:bg-[#1a1a1a] flex items-center gap-1"
                  onClick={() => router.push("/login")}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  {language === "ar" ? "تسجيل الدخول" : "Login"}
                </Button>
              </>
            ) : (
              /* For logged in users: Sidebar toggle button with slightly smaller SVG */
              <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 rounded-md hover:bg-[#1a1a1a]">
                <svg width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.35719 3H14.6428C15.7266 2.99999 16.6007 2.99998 17.3086 3.05782C18.0375 3.11737 18.6777 3.24318 19.27 3.54497C20.2108 4.02433 20.9757 4.78924 21.455 5.73005C21.7568 6.32234 21.8826 6.96253 21.9422 7.69138C22 8.39925 22 9.27339 22 10.3572V13.6428C22 14.7266 22 15.6008 21.9422 16.3086C21.8826 17.0375 21.7568 17.6777 21.455 18.27C20.9757 19.2108 20.2108 19.9757 19.27 20.455C18.6777 20.7568 18.0375 20.8826 17.3086 20.9422C16.6008 21 15.7266 21 14.6428 21H9.35717C8.27339 21 7.39925 21 6.69138 20.9422C5.96253 20.8826 5.32234 20.7568 4.73005 20.455C3.78924 19.9757 3.02433 19.2108 2.54497 18.27C2.24318 17.6777 2.11737 17.0375 2.05782 16.3086C1.99998 15.6007 1.99999 14.7266 2 13.6428V10.3572C1.99999 9.27341 1.99998 8.39926 2.05782 7.69138C2.11737 6.96253 2.24318 6.32234 2.54497 5.73005C3.02433 4.78924 3.78924 4.02433 4.73005 3.54497C5.32234 3.24318 5.96253 3.11737 6.69138 3.05782C7.39926 2.99998 8.27341 2.99999 9.35719 3ZM6.85424 5.05118C6.24907 5.10062 5.90138 5.19279 5.63803 5.32698C5.07354 5.6146 4.6146 6.07354 4.32698 6.63803C4.19279 6.90138 4.10062 7.24907 4.05118 7.85424C4.00078 8.47108 4 9.26339 4 10.4V13.6C4 14.7366 4.00078 15.5289 4.05118 16.1458C4.10062 16.7509 4.19279 17.0986 4.32698 17.362C4.6146 17.9265 5.07354 18.3854 5.63803 18.673C5.90138 18.8072 6.24907 18.8994 6.85424 18.9488C7.17922 18.9754 7.55292 18.9882 8 18.9943V5.0057C7.55292 5.01184 7.17922 5.02462 6.85424 5.05118ZM10 5V19H14.6C15.7366 19 16.5289 18.9992 17.1458 18.9488C17.7509 18.8994 18.0986 18.8072 18.362 18.673C18.9265 18.3854 19.3854 17.9265 19.673 17.362C19.8072 17.0986 19.8994 16.7509 19.9488 16.1458C19.9992 15.5289 20 14.7366 20 13.6V10.4C20 9.26339 19.9992 8.47108 19.9488 7.85424C19.8994 7.24907 19.8072 6.90138 19.673 6.63803C19.3854 6.07354 18.9265 5.6146 18.362 5.32698C18.0986 5.19279 17.7509 5.10062 17.1458 5.05118C16.5289 5.00078 15.7366 5 14.6 5H10Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Render either the chat interface or the children */}
        {isDashboardPage ? (
          <ChatProvider initialConversationId={currentConversationId}>
            <ChatInterface
              conversationId={currentConversationId}
              conversationTitle={conversationTitle}
              onConversationTitleChange={setConversationTitle}
            />
          </ChatProvider>
        ) : (
          <div className="flex-1 overflow-auto">{children}</div>
        )}
      </div>
    </div>
  )
}
