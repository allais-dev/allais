"use client"

import { Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

interface SettingsLinkProps {
  isCollapsed: boolean
  onCloseMobileSidebar?: () => void
}

export function SettingsLink({ isCollapsed, onCloseMobileSidebar }: SettingsLinkProps) {
  const router = useRouter()
  const { t, dir } = useLanguage()

  const handleClick = () => {
    if (onCloseMobileSidebar) {
      onCloseMobileSidebar()
    }
    router.push("/settings")
  }

  return (
    <button
      className={`flex ${
        isCollapsed ? "w-10 justify-center" : "w-full justify-start"
      } items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors duration-200 text-gray-400`}
      onClick={handleClick}
    >
      <Settings className="h-4 w-4" />
      {!isCollapsed && <span>{t("nav.settings")}</span>}
    </button>
  )
}
