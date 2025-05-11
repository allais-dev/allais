export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0f0f10]">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-500"></div>
        <p className="text-lg text-gray-400">Loading...</p>
      </div>
    </div>
  )
}
