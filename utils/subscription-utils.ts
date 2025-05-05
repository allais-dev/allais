"use client"

import { useSubscription } from "@/components/subscription-provider"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export function useSubscriptionCheck() {
  const { canAccessFeature, currentPlan } = useSubscription()
  const { toast } = useToast()
  const router = useRouter()

  const checkFeatureAccess = (feature: string): boolean => {
    return true // All features are accessible
  }

  const getMinimumPlanForFeature = (feature: string): string => {
    // This is a simplified mapping - in a real app, you'd have a more sophisticated way to determine this
    const featureToPlan: Record<string, string> = {
      "Full access to ChatGPT and Gemini models": "Standard",
      "Extended conversation history": "Standard",
      "Priority support": "Standard",
      "Unlimited pages of notes": "Premium",
      "Unlimited conversation history": "Premium",
      "Early access to new features": "Premium",
    }

    return featureToPlan[feature] || "Premium"
  }

  return {
    checkFeatureAccess,
    currentPlan,
  }
}
