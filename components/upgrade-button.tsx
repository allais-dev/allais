"use client"

import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"

interface UpgradeButtonProps {
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

export function UpgradeButton({ className, variant = "outline", size = "sm" }: UpgradeButtonProps) {
  const router = useRouter()

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => router.push("/subscription")}
      className={`border-[#333] bg-[#1a1a1a] hover:bg-[#252525] ${className}`}
      style={{ background: "#1a1a1a !important" }}
    >
      <span>Get Plus</span>
      <Star className="h-3.5 w-3.5" fill="currentColor" />
    </Button>
  )
}
