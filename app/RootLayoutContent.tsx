"use client"

import type React from "react"

import { useLanguage } from "@/contexts/language-context"
import { useEffect, useState } from "react"

export default function RootLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { language } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid hydration mismatch by only rendering after component mount
  if (!mounted) {
    return null
  }

  return (
    <html lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
      <body>{children}</body>
    </html>
  )
}
