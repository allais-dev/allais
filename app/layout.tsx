import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import { HighlightJsLoader } from "@/components/script-loader"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Allais AI Dashboard",
  description: "AI-powered dashboard for productivity",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"
        />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap');
        </style>
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <HighlightJsLoader />
      </body>
    </html>
  )
}
