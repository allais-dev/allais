"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Mail, Send } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function Contact() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [formError, setFormError] = useState("")

  const supabase = createClientComponentClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError("")

    try {
      // Insert the message into the database
      const { error } = await supabase.from("contact_messages").insert([
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          created_at: new Date().toISOString(),
        },
      ])

      if (error) throw error

      // Show success message
      setFormSuccess(true)
      setFormData({ name: "", email: "", subject: "", message: "" })

      // Reset form after 5 seconds
      setTimeout(() => {
        setFormSuccess(false)
      }, 5000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setFormError("There was an error submitting your message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      {/* Background animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/20 to-black/40 pointer-events-none"></div>

      {/* Animated background dots */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
        <div className="absolute top-3/4 left-1/3 h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
        <div className="absolute top-2/3 right-1/3 h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Grid overlay */}
        <div className="absolute inset-0 grid grid-cols-4 pointer-events-none">
          <div className="border-r border-zinc-800/30"></div>
          <div className="border-r border-zinc-800/30"></div>
          <div className="border-r border-zinc-800/30"></div>
        </div>

        {/* Navbar */}
        <header className="relative z-10">
          <div className="mx-auto flex h-20 items-center justify-between px-8">
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <div className="h-10 w-10 border border-zinc-700 flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:border-teal-500">
                  <div className="h-6 w-6 bg-white transition-all duration-300 group-hover:bg-teal-500"></div>
                </div>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-10">
              <Link
                href="/"
                className="text-sm text-zinc-400 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-teal-500 after:transition-all hover:after:w-full"
              >
                Home
              </Link>
              <Link
                href="/#features"
                className="text-sm text-zinc-400 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-teal-500 after:transition-all hover:after:w-full"
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                className="text-sm text-zinc-400 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-teal-500 after:transition-all hover:after:w-full"
              >
                Pricing
              </Link>
              <Link
                href="/#ai-models"
                className="text-sm text-zinc-400 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-teal-500 after:transition-all hover:after:w-full"
              >
                AI Models
              </Link>
              <Link
                href="/#blog"
                className="text-sm text-zinc-400 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-teal-500 after:transition-all hover:after:w-full"
              >
                Blog
              </Link>
              <Link
                href="/contact"
                className="text-sm text-white hover:text-zinc-300 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-teal-500 after:transition-all hover:after:w-full"
              >
                Contact
              </Link>
            </nav>

            <div className="hidden md:block">
              <Link
                href="/register"
                className="border border-zinc-700 px-5 py-2 text-sm text-white hover:bg-zinc-900 transition-all duration-300 flex items-center group hover:border-teal-500 hover:text-teal-500"
              >
                <span className="mr-2 h-2 w-2 bg-white rounded-full transition-all duration-300 group-hover:bg-teal-500"></span>
                Try For Free
              </Link>
            </div>
          </div>
        </header>

        {/* Contact Section */}
        <section className="relative">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <main className="relative z-10 flex flex-col justify-center min-h-[calc(100vh-5rem)] px-4 sm:px-8">
              {/* Center content */}
              <div className="flex flex-col items-center justify-center text-center mb-12">
                <div className="mb-6 sm:mb-8 animate-in-slide-up">
                  <div className="inline-flex items-center border border-zinc-700 px-4 sm:px-5 py-2 text-xs sm:text-sm group relative overflow-hidden">
                    <span className="relative z-10">
                      Get in Touch <Mail className="ml-2 h-4 w-4 inline" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  </div>
                </div>

                <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-4 animate-in-slide-up animate-delay-200 leading-[1.3] !important">
                  Contact <span className="text-zinc-400">Us</span>
                </h1>

                <p className="text-zinc-400 max-w-2xl mx-auto mb-8 sm:mb-12 animate-in-slide-up animate-delay-300 text-sm sm:text-base">
                  Have questions or feedback? We'd love to hear from you. Fill out the form below and we'll get back to
                  you as soon as possible.
                </p>
              </div>

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
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-zinc-400 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
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
                            value={formData.email}
                            onChange={handleChange}
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
                          value={formData.subject}
                          onChange={handleChange}
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
                          value={formData.message}
                          onChange={handleChange}
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
            </main>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-zinc-800 py-12 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-6">
                  <div className="h-10 w-10 border border-zinc-700 flex items-center justify-center mr-3 group-hover:border-teal-500 transition-colors group">
                    <div className="h-6 w-6 bg-white group-hover:bg-teal-500 transition-colors"></div>
                  </div>
                  <span className="text-lg font-medium">Allais</span>
                </div>
                <p className="text-zinc-500 text-sm mb-6">
                  The ultimate platform for accessing ChatGPT and Gemini with integrated task and note management.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-4">Platform</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="text-zinc-500 text-sm hover:text-white transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/#features" className="text-zinc-500 text-sm hover:text-white transition-colors">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="/#pricing" className="text-zinc-500 text-sm hover:text-white transition-colors">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/#ai-models" className="text-zinc-500 text-sm hover:text-white transition-colors">
                      AI Models
                    </Link>
                  </li>
                  <li>
                    <Link href="/#blog" className="text-zinc-500 text-sm hover:text-white transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-zinc-500 text-sm hover:text-white transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-4">Connect</h4>
                <ul className="space-y-2">
                  <li className="text-zinc-500 text-sm">hello.allais@gmail.com</li>
                  <li>
                    <Link
                      href="https://x.com/allais_space"
                      className="text-zinc-500 text-sm hover:text-white transition-colors"
                    >
                      Twitter
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://www.producthunt.com/@allais_space"
                      className="text-zinc-500 text-sm hover:text-white transition-colors"
                    >
                      ProductHunt
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-zinc-500 text-sm hover:text-white transition-colors">
                      Discord Community
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/privacy" className="text-zinc-500 text-sm hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-zinc-500 text-sm hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies" className="text-zinc-500 text-sm hover:text-white transition-colors">
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="text-zinc-500 text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} Allais All rights reserved.
              </div>
              <div className="flex space-x-4">
                <Link href="https://x.com/allais_space" className="text-zinc-500 hover:text-white transition-colors">
                  Twitter
                </Link>
                <Link
                  href="https://www.producthunt.com/@allais_space"
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  ProductHunt
                </Link>
                <Link href="#" className="text-zinc-500 hover:text-white transition-colors">
                  GitHub
                </Link>
                <Link href="#" className="text-zinc-500 hover:text-white transition-colors">
                  Discord
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
