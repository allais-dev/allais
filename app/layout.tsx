import type React from "react"
import { Inter, Noto_Sans } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { HighlightJsLoader } from "@/components/script-loader"
import { ErrorHandler } from "@/components/error-handler"

// Load the Inter font
const inter = Inter({ subsets: ["latin"] })

// Load Noto Sans for English/LTR content
const notoSans = Noto_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
})

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
    <html lang="en" suppressHydrationWarning className={notoSans.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css"
        />
        {/* Add preconnect for Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Add Tajawal font with all weights */}
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap"
          rel="stylesheet"
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
