"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function subscribeToNewsletter(formData: FormData) {
  const email = formData.get("email") as string

  if (!email || !email.includes("@")) {
    return { success: false, message: "Please provide a valid email address." }
  }

  try {
    const supabase = createServerComponentClient({ cookies })

    // Check if the email already exists
    const { data: existingUser } = await supabase.from("newsletter_subscribers").select("*").eq("email", email).single()

    if (existingUser) {
      return { success: true, message: "You are already subscribed to our newsletter!" }
    }

    // Insert the new subscriber
    const { error } = await supabase.from("newsletter_subscribers").insert([
      {
        email,
        subscribed_at: new Date().toISOString(),
      },
    ])

    if (error) throw error

    return { success: true, message: "Thank you for subscribing to our newsletter!" }
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return { success: false, message: "There was an error subscribing to the newsletter. Please try again." }
  }
}
