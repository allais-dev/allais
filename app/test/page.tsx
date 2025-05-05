export default function TestPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Test Page</h1>
        <p>If you can see this page, routing is working correctly.</p>
        <div className="mt-8 space-y-4">
          <p>Try these links:</p>
          <div className="flex flex-col space-y-2">
            <a href="/" className="text-blue-400 hover:underline">
              Home
            </a>
            <a href="/login" className="text-blue-400 hover:underline">
              Login
            </a>
            <a href="/register" className="text-blue-400 hover:underline">
              Register
            </a>
            <a href="/dashboard" className="text-blue-400 hover:underline">
              Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
