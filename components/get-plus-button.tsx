"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { PremiumIcon } from "./icons/premium-icon"

interface GetPlusButtonProps {
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

export function GetPlusButton({ className, variant = "outline", size = "sm" }: GetPlusButtonProps) {
  const router = useRouter()

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => router.push("/subscription")}
      className={`justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border hover:text-accent-foreground h-9 rounded-md px-3 text-xs flex items-center gap-1 border-[#333] bg-[#1a1a1a] hover:bg-[#252525] ${className}`}
      style={{ background: "#1a1a1a !important" }}
    >
      <span>Get Plus</span>
      <PremiumIcon />
    </Button>
  )
}
