"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useSubscription } from "@/components/subscription-provider"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Check } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function SubscriptionPage() {
  const { user, isLoading: authLoading } = useAuth()
  const {
    currentPlan,
    allPlans,
    isLoading: subscriptionLoading,
    changePlan,
    subscriptionStatus,
    subscriptionEnd,
    refreshSubscription,
  } = useSubscription()
  const [changingPlan, setChangingPlan] = useState<number | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { t } = useLanguage()

  // Check for success or canceled parameters in the URL
  useEffect(() => {
    const success = searchParams.get("success")
    const canceled = searchParams.get("canceled")

    if (success === "true") {
      toast({
        title: t("subscription.successTitle"),
        description: t("subscription.successDescription"),
      })
      refreshSubscription()
    } else if (canceled === "true") {
      toast({
        title: t("subscription.canceledTitle"),
        description: t("subscription.canceledDescription"),
        variant: "destructive",
      })
    }
  }, [searchParams, toast, refreshSubscription, t])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handleChangePlan = async () => {
    toast({
      title: t("subscription.allSetTitle"),
      description: t("subscription.allSetDescription"),
    })
  }

  const isLoading = authLoading || subscriptionLoading

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
          <p className="mt-4 text-white">{t("subscription.loading")}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="flex h-full flex-col bg-[#0f0f10] text-white">
      <div className="flex flex-1 overflow-auto">
        <main className="w-full p-8">
          <div className="mx-auto max-w-3xl">
            {/* Subscription Plans Section */}
            <div className="rounded-md border border-[#333333] bg-[#111] p-6 mb-12">
              {/* Heading and description */}
              <div className="mb-8">
                <h1 className="mb-4 text-2xl font-bold">{t("subscription.title")}</h1>
                <p className="text-gray-400">{t("subscription.selectPlan")}</p>
                <p className="mt-2 text-gray-400">{t("subscription.newBillingCycle")}</p>
              </div>

              {/* Plan Selection */}
              <div className="space-y-4">
                {/* Free Plan with All Features */}
                <div className="relative rounded-md border border-blue-500 bg-[#111] p-4 transition-all">
                  <div className="flex items-center">
                    <div className="mr-3 flex h-5 w-5 items-center justify-center">
                      <div className="h-4 w-4 rounded-full border border-blue-500 bg-blue-500">
                        <div className="h-2 w-2 rounded-full bg-white m-auto" style={{ marginTop: "3px" }}></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{t("subscription.freePlan")}</div>
                      </div>
                      <p className="mt-1 text-sm text-gray-400">{t("subscription.fullAccess")}</p>

                      {/* Features List */}
                      <div className="mt-3 space-y-2">
                        <div className="flex items-start">
                          <Check className="mr-2 h-4 w-4 text-gray-400 mt-0.5" />
                          <span className="text-sm text-gray-400">{t("subscription.unlimitedMessages")}</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="mr-2 h-4 w-4 text-gray-400 mt-0.5" />
                          <span className="text-sm text-gray-400">{t("subscription.unlimitedPages")}</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="mr-2 h-4 w-4 text-gray-400 mt-0.5" />
                          <span className="text-sm text-gray-400">{t("subscription.accessToAI")}</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="mr-2 h-4 w-4 text-gray-400 mt-0.5" />
                          <span className="text-sm text-gray-400">{t("subscription.prioritySupport")}</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="mr-2 h-4 w-4 text-gray-400 mt-0.5" />
                          <span className="text-sm text-gray-400">{t("subscription.earlyAccess")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-400">{t("subscription.enjoyFree")}</div>
              </div>
            </div>

            {/* Current Plan Details */}
            <div className="mt-12 rounded-md border border-[#333333] bg-[#111] p-6 mb-24">
              <h2 className="mb-6 text-lg font-medium">{t("subscription.currentPlanDetails")}</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{t("subscription.plan")}</span>
                  <span className="text-sm font-medium">{currentPlan?.name || t("subscription.free")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{t("subscription.status")}</span>
                  <span
                    className={`text-sm font-medium ${
                      subscriptionStatus === "active" ? "text-green-400" : "text-yellow-400"
                    }`}
                  >
                    {subscriptionStatus === "active" ? t("subscription.active") : t("subscription.inactive")}
                  </span>
                </div>
                {subscriptionEnd && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">{t("subscription.nextBillingDate")}</span>
                    <span className="text-sm font-medium">{new Date(subscriptionEnd).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{t("subscription.price")}</span>
                  <span className="text-sm font-medium">
                    ${currentPlan?.price || "0"}/{t("subscription.month")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
