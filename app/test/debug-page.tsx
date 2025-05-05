"use client"

import { DebugSaveTest } from "@/components/debug-save-test"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DebugPage() {
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
      <h1 className="text-2xl font-bold mb-6">Debug Page</h1>

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

      <DebugSaveTest />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
        <ol className="list-decimal list-inside space-y-2 pl-4">
          <li>Run the "Test Simple Save" to check if basic saving works</li>
          <li>Run the "Check Table Structure" to verify your database schema</li>
          <li>Run the "Check Permissions" to verify your RLS policies</li>
          <li>Check the browser console for any additional errors</li>
        </ol>
      </div>
    </div>
  )
}
