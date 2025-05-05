"use server"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Stripe from "stripe"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

// Define the price IDs for each plan
const PRICE_IDS = {
  standard: process.env.STRIPE_STANDARD_PRICE_ID || "price_1234567890",
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || "price_0987654321",
}

export async function createCheckoutSession(planId: number, userId: string) {
  try {
    // Determine which price ID to use based on the plan
    let priceId
    if (planId === 2) {
      priceId = PRICE_IDS.standard
    } else if (planId === 3) {
      priceId = PRICE_IDS.premium
    } else {
      // Free plan doesn't need a checkout session
      return { success: true, url: "/dashboard" }
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
      client_reference_id: userId,
      customer_email: undefined, // You can add user email here if available
      metadata: {
        userId: userId,
        planId: planId.toString(),
      },
    })

    // Return the checkout URL
    return { success: true, url: session.url }
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return { success: false, error: "Failed to create checkout session" }
  }
}

export async function handleSubscriptionWebhook(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature") as string

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || "")
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return new Response("Webhook signature verification failed", { status: 400 })
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    // Extract the user ID and plan ID from the metadata
    const userId = session.metadata?.userId
    const planId = session.metadata?.planId ? Number.parseInt(session.metadata.planId) : null

    if (userId && planId) {
      // Update the user's subscription in your database
      const supabase = createClientComponentClient()

      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_plan_id: planId,
          subscription_status: "active",
          subscription_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        })
        .eq("id", userId)

      if (error) {
        console.error("Error updating subscription:", error)
        return new Response("Error updating subscription", { status: 500 })
      }
    }
  }

  return new Response("Webhook received", { status: 200 })
}
