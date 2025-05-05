import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { HighlightJsLoader } from "@/components/script-loader"
import { ErrorHandler } from "@/components/error-handler"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AI Unified Dashboard",
  description: "AI Unified Dashboard",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css"
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <ErrorHandler />
          {children}
        </Providers>
        <HighlightJsLoader />
      </body>
    </html>
  )
}
