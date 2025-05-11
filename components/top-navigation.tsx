import { ArrowLeft, ArrowRight, RefreshCw, Search, Moon, Maximize, X } from "lucide-react"

export function TopNavigation() {
  return (
    <div className="flex h-12 items-center border-b border-[#333] px-4">
      <div className="flex items-center gap-2">
        <button className="rounded-md p-1 transition-colors duration-200 hover:bg-[#1a1a1a]">
          <ArrowLeft className="h-5 w-5 text-gray-400" />
        </button>
        <button className="rounded-md p-1 transition-colors duration-200 hover:bg-[#1a1a1a]">
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </button>
        <button className="rounded-md p-1 transition-colors duration-200 hover:bg-[#1a1a1a]">
          <RefreshCw className="h-5 w-5 text-gray-400" />
        </button>
      </div>
      <div className="mx-4 flex flex-1 items-center rounded-md bg-gray-900 px-3 py-1.5">
        <Search className="mr-2 h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-400">/dashboard</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="rounded-md p-1 transition-colors duration-200 hover:bg-[#1a1a1a]">
          <Moon className="h-5 w-5 text-gray-400" />
        </button>
        <button className="rounded-md p-1 transition-colors duration-200 hover:bg-[#1a1a1a]">
          <Maximize className="h-5 w-5 text-gray-400" />
        </button>
        <button className="rounded-md p-1 transition-colors duration-200 hover:bg-[#1a1a1a]">
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>
    </div>
  )
}
