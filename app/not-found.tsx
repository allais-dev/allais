"use client"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NotFound() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleGoHome = () => {
    setIsNavigating(true)
    router.push("/")
  }

  const handleGoToDashboard = () => {
    setIsNavigating(true)
    router.push("/dashboard")
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#050505] text-white relative overflow-hidden">
      {/* Background animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/20 to-black/40 pointer-events-none"></div>

      {/* Animated background dots */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
        <div className="absolute top-3/4 left-1/3 h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
        <div className="absolute top-2/3 right-1/3 h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 grid grid-cols-4 pointer-events-none">
        <div className="border-r border-zinc-800/30"></div>
        <div className="border-r border-zinc-800/30"></div>
        <div className="border-r border-zinc-800/30"></div>
      </div>

      {/* Animated elements with absolute positioning */}
      <div className="absolute top-20 left-10 animate-float-slow opacity-80">
        <div className="flex items-start">
          <div className="mr-3 mt-1 transform rotate-45">
            <div className="h-3 w-3 bg-white"></div>
          </div>
          <div>
            <div className="text-sm font-medium">Error</div>
            <div className="text-xs text-zinc-500">Page not found</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-20 left-10 animate-float-slow-delay opacity-80">
        <div className="flex items-center">
          <div className="h-4 w-4 border border-zinc-700 mr-3"></div>
          <div>
            <div className="text-sm font-medium">404</div>
            <div className="text-xs text-zinc-500">Not Found</div>
          </div>
        </div>
      </div>

      <div className="absolute top-20 right-10 animate-float-slow-delay-3 opacity-80">
        <div className="flex items-center justify-end">
          <div className="h-4 w-4 border border-zinc-700 mr-3"></div>
          <div>
            <div className="text-sm font-medium">Navigation</div>
            <div className="text-xs text-zinc-500">Lost</div>
          </div>
        </div>
      </div>

      {/* Center content */}
      <div className="flex flex-col items-center justify-center text-center z-10 px-4">
        <div className="mb-8 animate-in-slide-up">
          <div className="inline-flex items-center border border-zinc-700 px-5 py-2 text-sm hover:bg-zinc-900 transition-colors group relative overflow-hidden">
            <span className="relative z-10">404 Error</span>
            <span className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-in-slide-up animate-delay-200 leading-[1.4]">
          Page Not <span className="text-zinc-400">Found</span>
        </h1>

        <p className="text-zinc-400 max-w-2xl mx-auto mb-12 animate-in-slide-up animate-delay-300">
          The page you are looking for doesn't exist or has been moved to another location.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in-slide-up animate-delay-400">
          <button
            onClick={handleGoHome}
            disabled={isNavigating}
            className="border border-zinc-700 px-8 py-3 text-sm hover:bg-zinc-900 transition-all duration-300 flex items-center group hover:border-teal-500 hover:text-teal-500 relative overflow-hidden"
          >
            <span className="relative z-10">
              Return Home <ArrowRight className="ml-2 h-4 w-4 inline transition-transform group-hover:translate-x-1" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </button>
          <button
            onClick={handleGoToDashboard}
            disabled={isNavigating}
            className="border border-zinc-700 bg-white text-black px-8 py-3 text-sm hover:bg-zinc-200 transition-colors relative overflow-hidden group"
          >
            <span className="relative z-10">Go to Dashboard</span>
            <span className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </button>
        </div>
      </div>
    </div>
  )
}
