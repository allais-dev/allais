"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { User2, Mail, Edit2, Save, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
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
          setProfileImage(data.avatar_url)
        }

        // Set email from auth user
        setEmail(user.email || "")
      } catch (error) {
        console.error("Unexpected error fetching profile:", error)
      }
    }

    fetchProfile()
  }, [user, supabase])

  const handleSaveProfile = async () => {
    if (!user) return

    setIsSaving(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          updated_at: new Date().toISOString(),
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

      setIsEditing(false)
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
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f0f10]">
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
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="mr-4 border-[#ffffff1f] bg-[#141415] text-white hover:bg-[#1a1a1a] hover:text-white"
                onClick={() => router.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">User Profile</h1>
            </div>

            <div className="rounded-lg border border-[#333] bg-[#1a1a1a] p-6">
              <div className="mb-6 flex flex-col items-center sm:flex-row sm:items-start">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[#0f0f10] sm:mb-0 sm:mr-6">
                  {profileImage ? (
                    <img
                      src={profileImage || "/placeholder.svg"}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <User2 className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="mb-1 text-xl font-bold">{displayName || "User"}</h2>
                  <p className="mb-4 text-gray-400">{email}</p>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#ffffff1f] bg-[#141415] text-white hover:bg-[#1a1a1a] hover:text-white"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#ffffff1f] bg-[#141415] text-white hover:bg-[#1a1a1a] hover:text-white"
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#141415] text-white border-[#ffffff1f] hover:bg-[#1a1a1a] hover:text-white"
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Display Name</label>
                  {isEditing ? (
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-[#0f0f10] border-[#333] text-white"
                      placeholder="Enter your display name"
                    />
                  ) : (
                    <div className="rounded-md bg-[#0f0f10] px-3 py-2 text-white">{displayName || "Not set"}</div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Email Address</label>
                  <div className="flex items-center rounded-md bg-[#0f0f10] px-3 py-2 text-white">
                    <Mail className="mr-2 h-4 w-4 text-gray-400" />
                    {email}
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Email address cannot be changed</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Account Created</label>
                  <div className="rounded-md bg-[#0f0f10] px-3 py-2 text-white">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-[#333] pt-6">
                <h3 className="mb-4 text-lg font-medium">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-md bg-[#0f0f10] px-4 py-3">
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-gray-400">Change your account password</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#ffffff1f] bg-[#141415] text-white hover:bg-[#1a1a1a] hover:text-white"
                      onClick={() => router.push("/reset-password")}
                    >
                      Change
                    </Button>
                  </div>

                  <div className="flex items-center justify-between rounded-md bg-[#0f0f10] px-4 py-3">
                    <div>
                      <h4 className="font-medium">Theme Preference</h4>
                      <p className="text-sm text-gray-400">Currently set to Dark mode</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#ffffff1f] bg-[#141415] text-white hover:bg-[#1a1a1a] hover:text-white"
                      disabled
                    >
                      Change
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
