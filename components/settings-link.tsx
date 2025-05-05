"use client"

import { Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function SettingsLink({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const router = useRouter()

  const handleClick = () => {
    router.push("/settings")
  }

  return (
    <Button
      variant="ghost"
      className={`flex ${isCollapsed ? "w-10 justify-center" : "w-full justify-start"} items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors duration-200 text-gray-400 hover:bg-[#1a1a1a] hover:text-white`}
      onClick={handleClick}
    >
      <Settings className="h-4 w-4" />
      {!isCollapsed && <span>Settings</span>}
    </Button>
  )
}
