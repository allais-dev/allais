"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center bg-[#050505] text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Something went wrong!</h2>
            <p className="mb-6 text-gray-400">We apologize for the inconvenience.</p>
            <button onClick={reset} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
