"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function submitContactMessage(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const subject = formData.get("subject") as string
  const message = formData.get("message") as string

  if (!name || !email || !subject || !message) {
    return { success: false, message: "Please fill in all required fields." }
  }

  try {
    const supabase = createServerComponentClient({ cookies })

    // Insert the message into the database
    const { error } = await supabase.from("contact_messages").insert([
      {
        name,
        email,
        subject,
        message,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) throw error

    return { success: true, message: "Your message has been sent successfully!" }
  } catch (error) {
    console.error("Error submitting contact message:", error)
    return { success: false, message: "There was an error sending your message. Please try again." }
  }
}
