"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Check if email already exists
      const { data: existingSubscriber } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .eq("email", email)
        .single()

      if (existingSubscriber) {
        // If already subscribed but marked as inactive, reactivate
        if (!existingSubscriber.is_active) {
          await supabase
            .from("newsletter_subscribers")
            .update({
              is_active: true,
              unsubscribed_at: null,
              subscribed_at: new Date().toISOString(),
            })
            .eq("email", email)
        }

        setSuccess(true)
        setEmail("")
        setTimeout(() => setSuccess(false), 5000)
        return
      }

      // Insert new subscriber
      const { error: insertError } = await supabase.from("newsletter_subscribers").insert([
        {
          email,
          subscribed_at: new Date().toISOString(),
          is_active: true,
        },
      ])

      if (insertError) throw insertError

      setSuccess(true)
      setEmail("")
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      console.error("Error subscribing to newsletter:", err)
      setError("There was an error subscribing to the newsletter. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {success ? (
        <div className="bg-teal-900/30 border border-teal-500/30 p-4 text-center">
          <p className="text-teal-500 font-medium">Thank you for subscribing!</p>
          <p className="text-zinc-400 text-sm mt-1">You'll receive our updates soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your Email Address"
            required
            className="w-full bg-transparent border border-zinc-800 p-3 focus:outline-none focus:border-teal-500 transition-colors"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-white text-black py-3 px-6 w-full hover:bg-zinc-100 transition-colors group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">{isSubmitting ? "Subscribing..." : "Subscribe"}</span>
            <span className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </button>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="text-sm text-zinc-500">
            Already a member?{" "}
            <a href="/login" className="text-white hover:text-teal-500 transition-colors">
              Log In
            </a>
          </div>
        </form>
      )}
    </div>
  )
}
