"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import type { User, Session } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any | null; success: boolean }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any | null; success: boolean }>
  signInWithGoogle: () => Promise<{ error: any | null; success: boolean }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({ error: null, success: false }),
  signUp: async () => ({ error: null, success: false }),
  signInWithGoogle: async () => ({ error: null, success: false }),
  signOut: async () => {},
})

export const useAuth = () => {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setSession(null)
          setUser(null)
          setIsLoading(false)
          return
        }

        setSession(session)
        setUser(session?.user || null)
        setIsLoading(false)
      } catch (error) {
        console.error("Unexpected error during getSession:", error)
        setSession(null)
        setUser(null)
        setIsLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session?.user?.id)
      setSession(session)
      setUser(session?.user || null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Sign in error:", error)
        setIsLoading(false)
        return { error, success: false }
      }

      console.log("User signed in successfully:", data.user?.id)
      setUser(data.user)
      setSession(data.session)
      router.push("/dashboard")
      return { error: null, success: true }
    } catch (error) {
      console.error("Unexpected error during sign in:", error)
      setIsLoading(false)
      return { error, success: false }
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true)

      // Log the redirect URL for debugging
      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log("Google OAuth redirect URL:", redirectUrl)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            // Adding access_type=offline to get a refresh token
            access_type: "offline",
            // Adding prompt=consent to always show the Google consent screen
            prompt: "consent",
          },
        },
      })

      if (error) {
        console.error("Google sign in error:", error)
        return { error, success: false }
      }

      // This won't actually execute as the user will be redirected to Google
      return { error: null, success: true }
    } catch (error) {
      console.error("Unexpected error during Google sign in:", error)
      return { error, success: false }
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setIsLoading(true)

      // Sign up with user metadata that includes the display name
      // This metadata will be used by our database trigger to create the profile
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      })

      if (error) {
        console.error("Sign up error:", error)
        return { error, success: false }
      }

      console.log("User signed up successfully:", data.user?.id)

      // Ensure a profile exists for the new user
      try {
        // Check if profile already exists
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user?.id)
          .maybeSingle()

        if (profileError) {
          console.error("Error checking profile:", profileError)
        }

        // If no profile exists, create one
        if (!profileData && data.user?.id) {
          const { error: insertError } = await supabase.from("profiles").insert([
            {
              id: data.user.id,
              display_name: displayName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])

          if (insertError) {
            console.error("Error creating profile:", insertError)
          }
        }
      } catch (error) {
        console.error("Error handling profile creation:", error)
      }

      return { error: null, success: true }
    } catch (error) {
      console.error("Unexpected error during sign up:", error)

      // Check if this is a duplicate key error and handle it gracefully
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes("duplicate key") || errorMessage.includes("unique constraint")) {
        console.log("User already exists or profile already created")
        // This is actually not an error for the user - the account exists
        return { error: null, success: true }
      }

      return { error, success: false }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
