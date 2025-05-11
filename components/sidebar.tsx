"use client"

import type React from "react"
import {
  Plus,
  MessageSquare,
  FileText,
  Sparkles,
  LogOut,
  Settings,
  ChevronDown,
  Trash2,
  HelpCircle,
  Globe,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState, useCallback, useRef } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { PagesSidebar } from "@/components/pages-sidebar"
import { useRouter } from "next/navigation"
import { SettingsLink } from "@/components/settings-link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSubscription } from "@/components/subscription-provider"
import { apiClient } from "@/utils/api-client"
import { useToast } from "@/components/ui/use-toast"
import { SupportModal } from "@/components/support-modal"
import { UserAvatar } from "./user-avatar"
import { X } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface SidebarProps {
  isOpen: boolean
  onConversationSelect?: (conversationId: string | null, title: string) => void
  currentConversationId?: string | null
  onCloseMobileSidebar?: () => void
  hideSidebarToggle?: boolean
}

type Conversation = {
  id: string
  title: string
  created_at: string
  updated_at: string
}

// Create a cache for recent conversations
const recentChatsCache: {
  data: Conversation[] | null
  timestamp: number
  userId: string | null
} = {
  data: null,
  timestamp: 0,
  userId: null,
}

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000

// Local storage key for sidebar state
const SIDEBAR_STATE_KEY = "ai-dashboard-sidebar-collapsed"

interface NavItemProps {
  icon: React.ReactNode
  label: string
  isCollapsed: boolean
  path: string
  onClick?: () => void
}

function NavItem({ icon, label, isCollapsed, path, onClick }: NavItemProps) {
  const router = useRouter()
  const { t, dir } = useLanguage()

  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }

    // Special handling for Chat navigation to ensure it goes to /dashboard without query params
    if (label === "Chat") {
      router.push("/dashboard", undefined, { shallow: false })
    } else {
      // For other nav items, use normal navigation
      router.push(path, undefined, { shallow: false })
    }
  }

  // Get the translation key based on the label
  const translationKey = `nav.${label.toLowerCase()}`

  return (
    <button
      className={`flex ${isCollapsed ? "w-10 justify-center" : "w-full justify-start"} items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors duration-200 text-gray-400`}
      onClick={handleClick}
    >
      {icon}
      {!isCollapsed && <span>{t(translationKey)}</span>}
    </button>
  )
}

// Custom hook to detect if we're on mobile
function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px is the standard md breakpoint in Tailwind
    }

    // Check on mount
    checkIfMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return isMobile
}

export function Sidebar({
  isOpen = true,
  onConversationSelect,
  currentConversationId,
  onCloseMobileSidebar,
  hideSidebarToggle = false,
}: SidebarProps) {
  const { user, signOut } = useAuth()
  const [recentChats, setRecentChats] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()
  const initialLoadComplete = useRef(false)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastClickedConversationId = useRef<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const { currentPlan } = useSubscription()
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const isMobile = useMobile()
  const { language, setLanguage, t, dir } = useLanguage()

  // Initialize collapsed state from localStorage
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem(SIDEBAR_STATE_KEY)
      setIsCollapsed(savedState === "true")
    }
  }, [])

  // Save collapsed state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SIDEBAR_STATE_KEY, isCollapsed.toString())
    }
  }, [isCollapsed])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (user) {
      setUserEmail(user.email || "")
    }
  }, [user])

  const toggleSidebar = () => {
    // If on mobile and onCloseMobileSidebar is provided, close the sidebar
    if (isMobile && onCloseMobileSidebar) {
      onCloseMobileSidebar()
    } else {
      // On desktop, toggle the collapsed state
      setIsCollapsed(!isCollapsed)
    }
  }

  // Function to fetch recent conversations
  const fetchRecentConversations = useCallback(
    async (forceRefresh = false) => {
      if (!user) return

      // Check if we have valid cached data for this user
      const now = Date.now()
      const isCacheValid =
        recentChatsCache.data &&
        recentChatsCache.userId === user.id &&
        now - recentChatsCache.timestamp < CACHE_EXPIRATION &&
        !forceRefresh

      if (isCacheValid) {
        // Use cached data
        setRecentChats(recentChatsCache.data)
        return
      }

      // If we're here, we need to fetch from the database
      setIsLoading(true)

      try {
        // Ensure we're explicitly filtering by user_id
        const { data, error } = await supabase
          .from("chat_conversations")
          .select("id, title, created_at, updated_at")
          .eq("user_id", user.id) // Explicitly filter by current user ID
          .order("updated_at", { ascending: false })
          .limit(20)

        if (error) {
          console.error("Error fetching recent conversations:", error)
          setRecentChats([]) // Reset to empty array on error
          setIsLoading(false)
          return
        }

        // Update the cache
        recentChatsCache.data = data || []
        recentChatsCache.timestamp = now
        recentChatsCache.userId = user.id

        // Update state
        setRecentChats(data || [])
      } catch (error) {
        console.error("Unexpected error fetching conversations:", error)
        setRecentChats([]) // Reset to empty array on error
      } finally {
        setIsLoading(false)
      }
    },
    [user, supabase],
  )

  // Fetch recent conversations when component mounts or user changes
  useEffect(() => {
    if (user && !initialLoadComplete.current) {
      fetchRecentConversations()
      initialLoadComplete.current = true
    } else if (user) {
      // If user changed, force a refresh
      if (recentChatsCache.userId !== user.id) {
        fetchRecentConversations(true)
      } else {
        // Otherwise use cache if available
        fetchRecentConversations()
      }
    }
  }, [fetchRecentConversations, user])

  // Set up a subscription to refresh conversations when they change
  useEffect(() => {
    if (!user) return

    // Subscribe to changes in the chat_conversations table
    const subscription = supabase
      .channel(`chat_conversations_changes_${user.id}`) // Add user ID to channel name for uniqueness
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_conversations",
          filter: `user_id=eq.${user.id}`, // Ensure filter is applied
        },
        (payload) => {
          // Refresh the conversation list when changes occur
          // Force refresh from database since we know data has changed
          fetchRecentConversations(true)
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, supabase, fetchRecentConversations])

  // Update the handleConversationClick function in the sidebar component
  const handleConversationClick = (conversationId: string) => {
    // Only navigate to conversations if user is logged in
    if (user) {
      // Close mobile sidebar if function is provided
      if (onCloseMobileSidebar) {
        onCloseMobileSidebar()
      }

      // Use the router to navigate to the conversation with replace to force a refresh
      router.push(`/dashboard?conversation=${conversationId}`, { scroll: false })
    } else {
      toast({
        title: t("chat.loginRequired"),
        description: t("chat.loginRequiredDesc"),
        variant: "destructive",
      })
    }
  }

  const handleNewChat = () => {
    // First, if onConversationSelect is available, call it with null to reset the conversation
    if (onConversationSelect) {
      onConversationSelect(null, "New Conversation")
    }

    // Close mobile sidebar if function is provided
    if (onCloseMobileSidebar) {
      onCloseMobileSidebar()
    }

    // Use direct window.location navigation to ensure we go to /dashboard without any query params
    window.location.href = "/dashboard"
  }

  const handleNavItemClick = (path: string) => {
    // Close mobile sidebar if function is provided
    if (onCloseMobileSidebar) {
      onCloseMobileSidebar()
    }

    // Navigate to the path
    router.push(path)
  }

  const deleteConversation = async (conversationId: string) => {
    if (!user) return

    try {
      // Use the ApiClient to delete the conversation and its messages
      const success = await apiClient.deleteConversation(conversationId, user.id)

      if (!success) {
        console.error("Failed to delete conversation")
        toast({
          title: "Error",
          description: t("chat.deleteError"),
          variant: "destructive",
        })
        return
      }

      // Update the local state
      setRecentChats(recentChats.filter((chat) => chat.id !== conversationId))

      toast({
        title: t("chat.deleted"),
        description: t("chat.deletedDesc"),
      })

      // If the deleted conversation is the current one, navigate to dashboard
      if (currentConversationId === conversationId && onConversationSelect) {
        onConversationSelect(null, "New Conversation")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Unexpected error deleting conversation:", error)
      toast({
        title: "Error",
        description: t("chat.deleteError"),
        variant: "destructive",
      })
    }
  }

  const changeLanguage = (newLanguage: "en" | "ar") => {
    setLanguage(newLanguage)

    // Show toast in the new language
    const message = newLanguage === "en" ? "Language has been changed to English" : "تم تغيير اللغة إلى العربية"

    toast({
      title: newLanguage === "en" ? "Language Changed" : "تم تغيير اللغة",
      description: message,
    })
  }

  if (!isOpen) return null

  const username = userEmail.split("@")[0]

  return (
    <div
      className={`${isCollapsed ? "w-[60px]" : isMobile ? "w-full" : "w-[270px]"} flex-shrink-0 ${
        dir === "rtl" ? "border-l border-[#333333]" : "border-r border-[#333333]"
      } bg-[#141414] transition-all duration-300 h-full flex flex-col relative overflow-hidden`}
      dir={dir}
    >
      {isMobileSidebarOpen && (
        <div className="mobile-sidebar-header md:hidden">
          {/* Mobile sidebar header with logo and close button - adjusted for RTL */}
          <div className={`flex items-center justify-between w-full ${dir === "rtl" ? "flex-row" : ""}`}>
            <h2 className="text-xl font-semibold">Allais</h2>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="mobile-sidebar-close"
              aria-label="Close sidebar"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
      {/* User profile at bottom - fixed */}
      <div className="flex-shrink-0 mt-auto border-t border-[#333333] absolute bottom-0 left-0 right-0 bg-[#141414] z-10">
        {user ? (
          !isCollapsed ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full focus:outline-none">
                <div className="flex w-full items-center justify-between px-3 py-2 hover:bg-[#1a1a1a] transition-colors">
                  <div className="flex items-center gap-2">
                    <UserAvatar />
                    <div className="flex flex-col items-start">
                      <span className="text-sm text-white">{username}</span>
                      <span className="text-xs text-emerald-400">
                        {user ? <>{currentPlan?.name || t("user.free")}</> : t("user.free")}
                      </span>
                    </div>
                  </div>
                  <Settings className="h-4 w-4 text-gray-400" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-black border-[#333333] text-white" align="end">
                <div className="px-4 py-2">
                  <p className="text-sm text-gray-400">{userEmail}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <UserAvatar />
                    <div className="flex flex-col items-start">
                      <span className="text-sm text-white">{username}</span>
                      <span className="text-xs text-emerald-400">{currentPlan?.name || t("user.free")}</span>
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator className="bg-[#333333]" />

                <DropdownMenuItem
                  className="hover:bg-[#252525] cursor-pointer"
                  onClick={() => {
                    router.push("/settings")
                    if (onCloseMobileSidebar) onCloseMobileSidebar()
                  }}
                >
                  <Settings className={`h-4 w-4 ${dir === "rtl" ? "ml-2" : "mr-2"}`} />
                  <span>{t("nav.settings")}</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="hover:bg-[#252525] cursor-pointer" onClick={signOut}>
                  <LogOut className={`h-4 w-4 ${dir === "rtl" ? "ml-2" : "mr-2"}`} />
                  <span>{t("action.signOut")}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-[#333333]" />

                <DropdownMenuLabel className="text-xs text-gray-400 font-normal">
                  {t("user.preferences")}
                </DropdownMenuLabel>

                <div className="px-4 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t("user.language")}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 text-sm bg-[#252525] px-2 py-1 rounded-md">
                        {language === "en" ? t("language.english") : t("language.arabic")}
                        <ChevronDown className="h-3 w-3" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-black border-[#333333] text-white">
                        <DropdownMenuItem
                          className="hover:bg-[#252525] cursor-pointer"
                          onClick={() => changeLanguage("en")}
                        >
                          {t("language.english")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="hover:bg-[#252525] cursor-pointer"
                          onClick={() => changeLanguage("ar")}
                        >
                          {t("language.arabic")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none w-full">
                <div className="flex flex-col items-center p-2">
                  <UserAvatar />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-black border-[#333333] text-white" align="end">
                <div className="px-4 py-2">
                  <p className="text-sm text-gray-400">{userEmail}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <UserAvatar />
                    <div className="flex flex-col items-start">
                      <span className="text-sm text-white">{username}</span>
                      <span className="text-xs text-emerald-400">{currentPlan?.name || t("user.free")}</span>
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator className="bg-[#333333]" />

                <DropdownMenuItem
                  className="hover:bg-[#252525] cursor-pointer"
                  onClick={() => {
                    router.push("/settings")
                    if (onCloseMobileSidebar) onCloseMobileSidebar()
                  }}
                >
                  <Settings className={`h-4 w-4 ${dir === "rtl" ? "ml-2" : "mr-2"}`} />
                  <span>{t("nav.settings")}</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="hover:bg-[#252525] cursor-pointer" onClick={signOut}>
                  <LogOut className={`h-4 w-4 ${dir === "rtl" ? "ml-2" : "mr-2"}`} />
                  <span>{t("action.signOut")}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-[#333333]" />

                <DropdownMenuLabel className="text-xs text-gray-400 font-normal">
                  {t("user.preferences")}
                </DropdownMenuLabel>

                <div className="px-4 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t("user.language")}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 text-sm bg-[#252525] px-2 py-1 rounded-md">
                        {language === "en" ? t("language.english") : t("language.arabic")}
                        <ChevronDown className="h-3 w-3" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-black border-[#333333] text-white">
                        <DropdownMenuItem
                          className="hover:bg-[#252525] cursor-pointer"
                          onClick={() => changeLanguage("en")}
                        >
                          {t("language.english")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="hover:bg-[#252525] cursor-pointer"
                          onClick={() => changeLanguage("ar")}
                        >
                          {t("language.arabic")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        ) : // Login & Register button and language dropdown for non-logged in users
        isCollapsed ? (
          <div className="flex flex-col items-center p-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-[#333333] bg-[#141415] hover:bg-[#1a1a1a] text-white"
              onClick={() => router.push("/login")}
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className={`flex items-center ${dir === "rtl" ? "flex-row-reverse" : ""} justify-between px-3 py-2`}>
            <Button
              variant="outline"
              size="sm"
              className="border-[#333333] bg-[#141415] hover:bg-[#1a1a1a] text-white"
              onClick={() => router.push("/login")}
            >
              <User className={`h-4 w-4 ${dir === "rtl" ? "ml-2" : "mr-2"}`} />
              {t("action.login")}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm bg-[#141415] px-2 py-1 rounded-md border border-[#333333]">
                <Globe className={`h-4 w-4 ${dir === "rtl" ? "ml-1" : "mr-1"}`} />
                {language === "en" ? "EN" : "AR"}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black border-[#333333] text-white">
                <DropdownMenuItem className="hover:bg-[#252525] cursor-pointer" onClick={() => changeLanguage("en")}>
                  {language === "en" ? "English" : "الإنجليزية"}
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-[#252525] cursor-pointer" onClick={() => changeLanguage("ar")}>
                  {language === "en" ? "Arabic" : "العربية"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Main content area - everything scrolls */}
      <div
        className="absolute top-0 left-0 right-0 bottom-[48px] overflow-y-auto overflow-x-hidden tiny-scrollbar border-[#333333]"
        style={{ width: "100%" }}
      >
        {/* Header with logo and toggle button - COMPLETELY REWRITTEN */}
        <div className="flex items-center justify-between p-4">
          {!isCollapsed && (
            <h1 className="text-xl font-bold truncate">
              <span className="text-white">Allais</span>
            </h1>
          )}
          {/* Sidebar toggle button - positioned correctly based on language direction */}
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1 transition-colors duration-200 hover:bg-[#1a1a1a] text-gray-400 flex-shrink-0"
            style={{ marginRight: dir === "rtl" ? "auto" : "", marginLeft: dir === "ltr" ? "auto" : "" }}
          >
            <svg width="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.35719 3H14.6428C15.7266 2.99999 16.6007 2.99998 17.3086 3.05782C18.0375 3.11737 18.6777 3.24318 19.27 3.54497C20.2108 4.02433 20.9757 4.78924 21.455 5.73005C21.7568 6.32234 21.8826 6.96253 21.9422 7.69138C22 8.39925 22 9.27339 22 10.3572V13.6428C22 14.7266 22 15.6008 21.9422 16.3086C21.8826 17.0375 21.7568 17.6777 21.455 18.27C20.9757 19.2108 20.2108 19.9757 19.27 20.455C18.6777 20.7568 18.0375 20.8826 17.3086 20.9422C16.6008 21 15.7266 21 14.6428 21H9.35717C8.27339 21 7.39925 21 6.69138 20.9422C5.96253 20.8826 5.32234 20.7568 4.73005 20.455C3.78924 19.9757 3.02433 19.2108 2.54497 18.27C2.24318 17.6777 2.11737 17.0375 2.05782 16.3086C1.99998 15.6007 1.99999 14.7266 2 13.6428V10.3572C1.99999 9.27341 1.99998 8.39926 2.05782 7.69138C2.11737 6.96253 2.24318 6.32234 2.54497 5.73005C3.02433 4.78924 3.78924 4.02433 4.73005 3.54497C5.32234 3.24318 5.96253 3.11737 6.69138 3.05782C7.39926 2.99998 8.27341 2.99999 9.35719 3ZM6.85424 5.05118C6.24907 5.10062 5.90138 5.19279 5.63803 5.32698C5.07354 5.6146 4.6146 6.07354 4.32698 6.63803C4.19279 6.90138 4.10062 7.24907 4.05118 7.85424C4.00078 8.47108 4 9.26339 4 10.4V13.6C4 14.7366 4.00078 15.5289 4.05118 16.1458C4.10062 16.7509 4.19279 17.0986 4.32698 17.362C4.6146 17.9265 5.07354 18.3854 5.63803 18.673C5.90138 18.8072 6.24907 18.8994 6.85424 18.9488C7.17922 18.9754 7.55292 18.9882 8 18.9943V5.0057C7.55292 5.01184 7.17922 5.02462 6.85424 5.05118ZM10 5V19H14.6C15.7366 19 16.5289 18.9992 17.1458 18.9488C17.7509 18.8994 18.0986 18.8072 18.362 18.673C18.9265 18.3854 19.3854 17.9265 19.673 17.362C19.8072 17.0986 19.8994 16.7509 19.9488 16.1458C19.9992 15.5289 20 14.7366 20 13.6V10.4C20 9.26339 19.9992 8.47108 19.9488 7.85424C19.8994 7.24907 19.8072 6.90138 19.673 6.63803C19.3854 6.07354 18.9265 5.6146 18.362 5.32698C18.0986 5.19279 17.7509 5.10062 17.1458 5.05118C16.5289 5.00078 15.7366 5 14.6 5H10Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <div className="px-3 py-2">
          {/* New Chat button - always LTR layout */}
          <Button
            variant="outline"
            className={`flex ${isCollapsed ? "w-10 justify-center" : "w-full new-chat-button"} items-center gap-2 border-[#ffffff1f] bg-[#141415] text-white transition-all duration-200 hover:border-[#ffffff1f] hover:bg-[#1a1a1a] ${isCollapsed ? "justify-center" : "justify-center relative"}`}
            onClick={handleNewChat}
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span className="truncate">{t("action.newChat")}</span>}
          </Button>
        </div>

        <nav className="space-y-1 px-3 py-2">
          <NavItem
            icon={<MessageSquare className="h-4 w-4" />}
            label="Chat"
            isCollapsed={isCollapsed}
            path="/dashboard"
            onClick={() => {
              if (onCloseMobileSidebar) onCloseMobileSidebar()
              router.push("/dashboard")
            }}
          />
          <NavItem
            icon={<FileText className="h-4 w-4" />}
            label="Pages"
            isCollapsed={isCollapsed}
            path="/pages"
            onClick={() => {
              if (onCloseMobileSidebar) onCloseMobileSidebar()
              router.push("/pages")
            }}
          />
          <NavItem
            icon={<Sparkles className="h-4 w-4" />}
            label="Subscription"
            isCollapsed={isCollapsed}
            path="/subscription"
            onClick={() => {
              if (onCloseMobileSidebar) onCloseMobileSidebar()
              router.push("/subscription")
            }}
          />
          <NavItem
            icon={<HelpCircle className="h-4 w-4" />}
            label="Support"
            isCollapsed={isCollapsed}
            path="#"
            onClick={() => {
              if (onCloseMobileSidebar) onCloseMobileSidebar()
              setIsSupportModalOpen(true)
            }}
          />
          <SettingsLink isCollapsed={isCollapsed} onCloseMobileSidebar={onCloseMobileSidebar} />
        </nav>

        {/* Pages Sidebar - only show when logged in */}
        {!isCollapsed && user && (
          <div className={isCollapsed ? "hidden" : "block"}>
            <PagesSidebar isCollapsed={isCollapsed} onCloseMobileSidebar={onCloseMobileSidebar} />
          </div>
        )}

        {/* Recent Chats - show for all users */}
        {!isCollapsed && (
          <>
            <div className="mt-4 px-4 py-2">
              {/* Always use LTR layout for the header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {t("chat.recentChats")}
                </h2>
                <button
                  className="rounded p-1 transition-colors duration-200 hover:bg-[#1a1a1a]"
                  onClick={handleNewChat}
                >
                  <Plus className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="px-3 py-2 space-y-1">
              {user ? (
                // For logged-in users, show their actual chats
                isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"></div>
                    <span className="ml-2 text-xs text-gray-500">{t("chat.loadingChats")}</span>
                  </div>
                ) : recentChats.length > 0 ? (
                  recentChats.map((chat) => (
                    <div key={chat.id} className="flex items-center group">
                      <div
                        className={`flex-1 flex items-center rounded-md px-2 py-1.5 text-sm ${
                          currentConversationId === chat.id
                            ? "bg-[#1a1a1a] text-white"
                            : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
                        } cursor-pointer`}
                        onClick={() => handleConversationClick(chat.id)}
                      >
                        <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 mr-2" />
                        <span className="truncate">{chat.title || t("chat.untitledChat")}</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(t("chat.deleteConfirm"))) {
                              deleteConversation(chat.id)
                            }
                          }}
                          className="rounded-md p-1 text-gray-500 hover:bg-[#333] hover:text-red-400"
                          title="Delete conversation"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">{t("chat.noChats")}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 text-xs border-[#333] bg-transparent hover:bg-[#1a1a1a]"
                      onClick={handleNewChat}
                    >
                      {t("action.startChat")}
                    </Button>
                  </div>
                )
              ) : (
                // For non-logged-in users, show "No recent chats" with "Start a new chat" button
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">{t("chat.noChats")}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs border-[#333] bg-transparent hover:bg-[#1a1a1a]"
                    onClick={handleNewChat}
                  >
                    {t("action.startChat")}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Add some padding at the bottom for better scrolling */}
        <div className="h-12"></div>
      </div>
      {/* Support Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        userEmail={userEmail}
        userName={username}
      />
    </div>
  )
}

// Add a default export for the Sidebar component
export default Sidebar
