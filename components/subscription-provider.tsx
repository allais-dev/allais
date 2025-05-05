"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/auth-provider"

export type SubscriptionPlan = {
  id: number
  name: string
  slug: string
  description: string
  price: number
  features: string[]
}

export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "inactive"

type SubscriptionContextType = {
  currentPlan: SubscriptionPlan | null
  allPlans: SubscriptionPlan[]
  isLoading: boolean
  subscriptionStatus: SubscriptionStatus
  subscriptionEnd: Date | null
  changePlan: (planId: number) => Promise<boolean>
  canAccessFeature: (feature: string) => boolean
  getFeatureLimit: (feature: string) => number
  refreshSubscription: () => Promise<void>
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}

const defaultFeatureLimits: Record<string, Record<string, number>> = {
  free: {
    pages: -1, // unlimited
    conversations: -1, // unlimited
    messages_per_day: -1, // unlimited
  },
  standard: {
    pages: -1, // unlimited
    conversations: -1, // unlimited
    messages_per_day: -1, // unlimited
  },
  premium: {
    pages: -1, // unlimited
    conversations: -1, // unlimited
    messages_per_day: -1, // unlimited
  },
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  currentPlan: null,
  allPlans: [],
  isLoading: true,
  subscriptionStatus: "inactive",
  subscriptionEnd: null,
  changePlan: async () => false,
  canAccessFeature: () => false,
  getFeatureLimit: () => 0,
  refreshSubscription: async () => {},
  stripeCustomerId: null,
  stripeSubscriptionId: null,
})

export const useSubscription = () => useContext(SubscriptionContext)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null)
  const [allPlans, setAllPlans] = useState<SubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>("inactive")
  const [subscriptionEnd, setSubscriptionEnd] = useState<Date | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null)
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState<string | null>(null)

  // Update the fetchSubscriptionData function to better handle non-JSON responses and rate limiting

  // Replace the fetchSubscriptionData function with this improved version:

  const fetchSubscriptionData = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)

      // Default fallback plans in case of error
      const fallbackPlans = [
        {
          id: 1,
          name: "Free Plan",
          slug: "free",
          description: "Basic access with unlimited features",
          price: 0,
          features: ["Unlimited messages", "All AI models", "Priority support"],
        },
      ]

      // Add retry logic with exponential backoff
      let retryCount = 0
      const maxRetries = 3
      let delay = 2000 // Start with 2 second delay
      let plansData = null
      let plansError = null

      // Retry loop for fetching plans
      while (retryCount <= maxRetries) {
        try {
          // Add a delay before retrying (skip on first attempt)
          if (retryCount > 0) {
            console.log(`Retry attempt ${retryCount} for subscription plans, waiting ${delay}ms...`)
            await new Promise((resolve) => setTimeout(resolve, delay))
          }

          // Fetch all available plans
          const response = await supabase.from("subscription_plans").select("*").order("price", { ascending: true })

          plansData = response.data
          plansError = response.error

          // If successful, break out of retry loop
          if (!plansError) {
            break
          }

          console.error(`Error fetching subscription plans (attempt ${retryCount + 1}):`, plansError)

          // Increment retry counter and increase delay
          retryCount++
          delay *= 2 // Exponential backoff
        } catch (error) {
          console.error(`Unexpected error in subscription plans fetch (attempt ${retryCount + 1}):`, error)

          // Increment retry counter and increase delay
          retryCount++
          delay *= 2 // Exponential backoff

          // If we've reached max retries, use fallback data
          if (retryCount > maxRetries) {
            console.log("Max retries reached, using fallback subscription plans")
            setAllPlans(fallbackPlans)
            const freePlan = fallbackPlans.find((plan) => plan.slug === "free")
            setCurrentPlan(freePlan || null)
            setSubscriptionStatus("inactive")
            setSubscriptionEnd(null)
            setIsLoading(false)
            return
          }
        }
      }

      // If we've exhausted retries or encountered an error, use fallback data
      if (plansError || !plansData) {
        console.log("Using fallback subscription plans data")
        setAllPlans(fallbackPlans)
        const freePlan = fallbackPlans.find((plan) => plan.slug === "free")
        setCurrentPlan(freePlan || null)
        setSubscriptionStatus("inactive")
        setSubscriptionEnd(null)
        setIsLoading(false)
        return
      }

      // Format the plans data
      const formattedPlans = plansData.map((plan) => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : [],
      }))

      setAllPlans(formattedPlans)

      // Now fetch user's subscription with similar retry logic
      retryCount = 0
      delay = 2000
      let profileData = null
      let profileError = null

      // Use a more robust approach for fetching user subscription
      while (retryCount <= maxRetries) {
        try {
          // Add a delay before retrying (skip on first attempt)
          if (retryCount > 0) {
            console.log(`Retry attempt ${retryCount} for user subscription, waiting ${delay}ms...`)
            await new Promise((resolve) => setTimeout(resolve, delay))
          }

          // Use a try-catch block specifically for the fetch operation
          try {
            // Fetch user's current subscription - only select columns that definitely exist
            const response = await supabase
              .from("profiles")
              .select("subscription_plan_id, subscription_status, subscription_period_end")
              .eq("id", user.id)
              .maybeSingle() // Use maybeSingle instead of single to handle no rows gracefully

            // Check if we got a valid response
            if (response.error) {
              throw response.error
            }

            profileData = response.data
            profileError = null
            break // Success, exit the retry loop
          } catch (fetchError) {
            // Handle specific error types
            if (fetchError instanceof Error) {
              // Check if this is a rate limiting error
              if (fetchError.message && fetchError.message.includes("Too Many Requests")) {
                console.warn(`Rate limit hit (429) on attempt ${retryCount + 1}, will retry after backoff`)
                profileError = new Error("Rate limited, will retry")
              } else {
                profileError = fetchError
              }
            } else {
              profileError = new Error("Unknown error during fetch")
            }

            console.error(`Error fetching user subscription (attempt ${retryCount + 1}):`, profileError)
          }

          // Increment retry counter and increase delay
          retryCount++
          delay *= 2 // Exponential backoff
        } catch (outerError) {
          console.error(`Unexpected outer error in user subscription fetch (attempt ${retryCount + 1}):`, outerError)

          // Increment retry counter and increase delay
          retryCount++
          delay *= 2 // Exponential backoff
        }
      }

      // If we've exhausted retries or encountered an error, use fallback data
      if (profileError || !profileData) {
        console.log("Using fallback user subscription data after exhausting retries")
        const freePlan = formattedPlans.find((plan) => plan.slug === "free") || fallbackPlans[0]
        setCurrentPlan(freePlan)
        setSubscriptionStatus("inactive")
        setSubscriptionEnd(null)
        setIsLoading(false)
        return
      }

      // Set subscription status and end date
      setSubscriptionStatus((profileData.subscription_status as SubscriptionStatus) || "inactive")
      setSubscriptionEnd(profileData.subscription_period_end ? new Date(profileData.subscription_period_end) : null)

      // Don't try to access Stripe fields that might not exist yet
      setStripeCustomerId(null)
      setStripeSubscriptionId(null)

      // Try to access Stripe fields only if they exist
      try {
        // Check if the columns exist in the response
        if (profileData && "stripe_customer_id" in profileData) {
          setStripeCustomerId(profileData.stripe_customer_id || null)
        }
        if (profileData && "stripe_subscription_id" in profileData) {
          setStripeSubscriptionId(profileData.stripe_subscription_id || null)
        }
      } catch (error) {
        console.log("Stripe fields not available yet:", error)
      }

      // Find the current plan
      if (profileData.subscription_plan_id) {
        const userPlan = formattedPlans.find((plan) => plan.id === profileData.subscription_plan_id)
        setCurrentPlan(userPlan || null)
      } else {
        // Default to free plan if no plan is set
        const freePlan = formattedPlans.find((plan) => plan.slug === "free") || fallbackPlans[0]
        setCurrentPlan(freePlan)
      }
    } catch (error) {
      console.error("Fatal error in fetchSubscriptionData:", error)
      // Use fallback data in case of any other errors
      const fallbackPlans = [
        {
          id: 1,
          name: "Free Plan",
          slug: "free",
          description: "Basic access with unlimited features",
          price: 0,
          features: ["Unlimited messages", "All AI models", "Priority support"],
        },
      ]
      setAllPlans(fallbackPlans)
      const freePlan = fallbackPlans.find((plan) => plan.slug === "free")
      setCurrentPlan(freePlan || null)
      setSubscriptionStatus("inactive")
      setSubscriptionEnd(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch subscription data on mount or when user changes
  useEffect(() => {
    fetchSubscriptionData()
  }, [user])

  // Function to change subscription plan
  const changePlan = async (planId: number): Promise<boolean> => {
    if (!user) return false

    try {
      // In a real app, this would integrate with a payment processor
      // For now, we'll just update the database directly
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_plan_id: planId,
          subscription_status: "active",
          // Set subscription end date to 30 days from now
          subscription_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        console.error("Error updating subscription:", error)
        return false
      }

      // Refresh subscription data
      await fetchSubscriptionData()
      return true
    } catch (error) {
      console.error("Unexpected error changing plan:", error)
      return false
    }
  }

  // Function to check if user can access a feature
  const canAccessFeature = (feature: string): boolean => {
    return true // All features are available to everyone
  }

  // Function to get the limit for a specific feature
  const getFeatureLimit = (feature: string): number => {
    return -1 // unlimited for all features
  }

  const refreshSubscription = async () => {
    await fetchSubscriptionData()
  }

  return (
    <SubscriptionContext.Provider
      value={{
        currentPlan,
        allPlans,
        isLoading,
        subscriptionStatus,
        subscriptionEnd,
        changePlan,
        canAccessFeature,
        getFeatureLimit,
        refreshSubscription,
        stripeCustomerId,
        stripeSubscriptionId,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}
