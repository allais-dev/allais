"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) {
          console.error("Error fetching profile:", error)
          return
        }

        if (data) {
          setDisplayName(data.display_name || "")
        }

        // Set email from auth user
        setEmail(user.email || "")
      } catch (error) {
        console.error("Unexpected error fetching profile:", error)
      }
    }

    fetchProfile()
  }, [user, supabase])

  const handleSaveChanges = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
        })
        .eq("id", user.id)

      if (error) {
        console.error("Error updating profile:", error)
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Your profile has been updated.",
      })
    } catch (error) {
      console.error("Unexpected error updating profile:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
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
    <div className="flex h-screen flex-col bg-[#0f0f10] text-white">
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="mr-4 border-[#333] bg-transparent hover:bg-[#1a1a1a]"
                onClick={() => router.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Settings</h1>
            </div>

            {/* Updated Plan Summary */}
            <div className="mb-6 rounded-lg border border-[#333] bg-[#111] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Plan Summary</h2>
                <span className="text-xs bg-[#1a1a1a] text-emerald-400 px-2 py-1 rounded">Free Plan</span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-300">
                  You're currently on the Free Plan with unlimited access to all features.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 mb-4">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 mr-2"></div>
                  <p className="text-sm text-gray-300">Unlimited messages</p>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 mr-2"></div>
                  <p className="text-sm text-gray-300">Unlimited pages</p>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 mr-2"></div>
                  <p className="text-sm text-gray-300">All AI models</p>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 mr-2"></div>
                  <p className="text-sm text-gray-300">Priority support</p>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="rounded-lg border border-[#333] bg-[#111] p-6">
              <h2 className="text-lg font-medium mb-4">Account Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-300">Display Name</label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-[#1a1a1a] border-[#333] text-white text-sm"
                    placeholder="Enter your display name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-300">Email Address</label>
                  <Input value={email} disabled className="bg-[#1a1a1a] border-[#333] text-white opacity-70 text-sm" />
                  <p className="mt-1 text-xs text-gray-400">Email address cannot be changed</p>
                </div>

                <div className="flex justify-end">
                  <Button
                    className="bg-[#141415] text-white border border-[#ffffff1f] hover:bg-[#1a1a1a] hover:text-white text-xs"
                    onClick={handleSaveChanges}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
