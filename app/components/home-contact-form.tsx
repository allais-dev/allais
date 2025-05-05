"use client"

import { useState } from "react"
import { ArrowRight, Send } from "lucide-react"
import { submitContactMessage } from "@/app/actions/contact-actions"

export function HomeContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [formError, setFormError] = useState("")

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setFormError("")

    try {
      const result = await submitContactMessage(formData)

      if (result.success) {
        setFormSuccess(true)
        // Reset form after 5 seconds
        setTimeout(() => {
          setFormSuccess(false)
        }, 5000)
      } else {
        setFormError(result.message)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setFormError("There was an error submitting your message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto w-full animate-in-slide-up animate-delay-400">
      <div className="border border-zinc-800 p-8 transition-all duration-300 hover:border-teal-500/50 hover:bg-zinc-900/30">
        {formSuccess ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-teal-900/30 mb-6">
              <Send className="h-8 w-8 text-teal-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Message Sent!</h3>
            <p className="text-zinc-400 mb-6">Thank you for reaching out. We'll get back to you shortly.</p>
            <button
              onClick={() => setFormSuccess(false)}
              className="border border-zinc-700 px-6 py-3 text-sm hover:bg-zinc-900 transition-all duration-300 hover:border-teal-500 hover:text-teal-500"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-400 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full bg-transparent border border-zinc-800 p-3 focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full bg-transparent border border-zinc-800 p-3 focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-zinc-400 mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                className="w-full bg-transparent border border-zinc-800 p-3 focus:outline-none focus:border-teal-500 transition-colors"
                placeholder="What's this about?"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-zinc-400 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                className="w-full bg-transparent border border-zinc-800 p-3 focus:outline-none focus:border-teal-500 transition-colors"
                placeholder="Your message here..."
              ></textarea>
            </div>

            {formError && <div className="text-red-500 text-sm">{formError}</div>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="border border-zinc-700 px-8 py-3 text-sm hover:bg-zinc-900 transition-all duration-300 flex items-center group hover:border-teal-500 hover:text-teal-500 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10">
                  {isSubmitting ? "Sending..." : "Send Message"}{" "}
                  <ArrowRight className="ml-2 h-4 w-4 inline transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
