"use client"

import { Button } from "@/components/ui/button"
import { Code } from "lucide-react"

interface TestCodeButtonProps {
  onClick: () => void
}

export function TestCodeButton({ onClick }: TestCodeButtonProps) {
  return (
    <Button
      variant="outline"
      className="flex items-center gap-2 border-[#333] bg-transparent text-white"
      onClick={onClick}
    >
      <Code className="h-4 w-4" />
      <span>Test Code Highlighting</span>
    </Button>
  )
}
