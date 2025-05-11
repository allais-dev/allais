"use server"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function submitSupportMessage(formData: FormData) {
  try {
    const supabase = createClientComponentClient({ cookies })

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const subject = formData.get("subject") as string
    const message = formData.get("message") as string

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Insert the message into the contact_messages table
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      subject,
      message,
      user_id: user?.id || null,
      read: false,
    })

    if (error) {
      console.error("Error submitting support message:", error)
      return { success: false, message: "Failed to submit message. Please try again." }
    }

    return { success: true, message: "Your message has been sent successfully!" }
  } catch (error) {
    console.error("Unexpected error submitting support message:", error)
    return { success: false, message: "An unexpected error occurred. Please try again." }
  }
}
