"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

interface SubscriptionButtonProps {
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

export function SubscriptionButton({ className, variant = "outline", size = "sm" }: SubscriptionButtonProps) {
  const router = useRouter()

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => router.push("/subscription")}
      className={`border-[#333] bg-[#1a1a1a] hover:bg-[#252525] ${className}`}
    >
      <span>Upgrade</span>
      <Sparkles className="h-3.5 w-3.5" />
    </Button>
  )
}
