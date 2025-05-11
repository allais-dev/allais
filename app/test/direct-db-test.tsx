"use client"

import { DirectDbTest } from "@/components/direct-db-test"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DirectDbTestPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Direct Database Test</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Info</h2>
        <div className="p-4 bg-gray-900 rounded-md">
          <p>
            <strong>User ID:</strong> {user.id}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      </div>

      <DirectDbTest />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
        <ol className="list-decimal list-inside space-y-2 pl-4">
          <li>Run the "Test Direct Update" to check if basic database operations work</li>
          <li>Run the "Test With Stringify" to check if JSON serialization is working</li>
          <li>Run the "Test With Raw SQL" to bypass the Supabase client</li>
          <li>Run the "Test Simple Update" to check if non-JSON updates work</li>
        </ol>
      </div>
    </div>
  )
}
