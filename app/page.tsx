"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Menu, X, ArrowRight, Check, Star, Quote, Square, Diamond, Users, BarChart, Sparkles } from "lucide-react"
import { NewsletterForm } from "@/app/components/newsletter-form"
import { HomeContactForm } from "@/app/components/home-contact-form"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [hasScrolled, setHasScrolled] = useState(false)

  // Refs for sections
  const featuresRef = useRef<HTMLElement>(null)
  const pricingRef = useRef<HTMLElement>(null)
  const aiModelsRef = useRef<HTMLElement>(null)
  const blogRef = useRef<HTMLElement>(null)
  const contactRef = useRef<HTMLElement>(null)

  // Check if user is already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  // Add scroll event listener to trigger animations
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(true)

      // Add animation classes to elements with data-animate attribute
      const animatedElements = document.querySelectorAll("[data-animate]")

      animatedElements.forEach((element) => {
        const rect = element.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight - 100

        if (isVisible) {
          element.classList.add("animate-active")
        }
      })
    }

    // Initial check
    handleScroll()

    // Add scroll listener
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Function to scroll to a section
  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" })
      setMobileMenuOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    )
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
                className="text-sm text-white hover:text-zinc-300 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-teal-500 after:transition-all hover:after:w-full"
              >
                Home
              </Link>
              <button
                onClick={() => scrollToSection(featuresRef)}
                className="text-sm text-zinc-400 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-teal-500 after:transition-all hover:after:w-full"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection(pricingRef)}
                className="text-sm text-zinc-400 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-teal-500 after:transition-all hover:after:w-full"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection(aiModelsRef)}
                className="text-sm text-zinc-400 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-teal-500 after:transition-all hover:after:w-full"
              >
                AI Models
              </button>
              <button
                onClick={() => scrollToSection(blogRef)}
                className="text-sm text-zinc-400 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-teal-500 after:transition-all hover:after:w-full"
              >
                Blog
              </button>
              <button
                onClick={() => scrollToSection(contactRef)}
                className="text-sm text-zinc-400 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-teal-500 after:transition-all hover:after:w-full"
              >
                Contact
              </button>
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

            <div className="md:hidden">
              <button
                type="button"
                className="text-zinc-400 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute w-full bg-[#050505] border-b border-zinc-800 z-20">
              <div className="space-y-1 px-4 py-4 bg-[#050505]">
                <Link href="/" className="block py-2 text-base text-white" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Link>
                <button className="block py-2 text-base text-zinc-400" onClick={() => scrollToSection(featuresRef)}>
                  Features
                </button>
                <button className="block py-2 text-base text-zinc-400" onClick={() => scrollToSection(pricingRef)}>
                  Pricing
                </button>
                <button className="block py-2 text-base text-zinc-400" onClick={() => scrollToSection(aiModelsRef)}>
                  AI Models
                </button>
                <button className="block py-2 text-base text-zinc-400" onClick={() => scrollToSection(blogRef)}>
                  Blog
                </button>
                <button className="block py-2 text-base text-zinc-400" onClick={() => scrollToSection(contactRef)}>
                  Contact
                </button>
                <div className="pt-4">
                  <Link
                    href="/register"
                    className="block border border-zinc-700 px-4 py-2 text-center text-white hover:border-teal-500 hover:text-teal-500 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Try For Free
                  </Link>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="relative">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <main className="relative z-10 flex flex-col justify-center min-h-[calc(100vh-5rem)] px-4 sm:px-8">
              {/* Animated elements with absolute positioning */}
              <div className="absolute top-10 sm:top-20 left-4 sm:left-10 animate-float-slow opacity-80">
                <div className="flex items-start">
                  <div className="mr-3 mt-1 transform rotate-45">
                    <div className="h-3 w-3 bg-white"></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">ChatGPT</div>
                    <div className="text-xs text-zinc-500">Integrated</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 sm:bottom-20 left-4 sm:left-10 animate-float-slow-delay opacity-80">
                <div className="flex items-center">
                  <div className="h-4 w-4 border border-zinc-700 mr-3"></div>
                  <div>
                    <div className="text-sm font-medium">Tasks</div>
                    <div className="text-xs text-zinc-500">Organized</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 animate-float-slow-delay-2 opacity-80">
                <div className="flex items-center">
                  <div className="h-4 w-4 border border-zinc-700 mr-3"></div>
                  <div>
                    <div className="text-sm font-medium">Notes</div>
                    <div className="text-xs text-zinc-500">Integrated</div>
                  </div>
                </div>
              </div>

              <div className="absolute top-10 sm:top-20 right-4 sm:right-10 animate-float-slow-delay-3 opacity-80">
                <div className="flex items-center justify-end">
                  <div className="h-4 w-4 border border-zinc-700 mr-3"></div>
                  <div>
                    <div className="text-sm font-medium">Gemini</div>
                    <div className="text-xs text-zinc-500">Integrated</div>
                  </div>
                </div>
              </div>

              {/* Center content */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-6 sm:mb-8 animate-in-slide-up">
                  <Link
                    href="/login"
                    className="inline-flex items-center border border-zinc-700 px-4 sm:px-5 py-2 text-xs sm:text-sm hover:bg-zinc-900 transition-colors group relative overflow-hidden"
                  >
                    <span className="relative z-10">
                      ChatGPT & Gemini in One Place{" "}
                      <ArrowRight className="ml-2 h-4 w-4 inline transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  </Link>
                </div>

                <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-4 animate-in-slide-up animate-delay-200 leading-[1.3] !important">
                  One Platform&nbsp;for{" "}
                  <span className="block">
                    <span className="text-zinc-400">All AI Models</span>
                  </span>
                </h1>

                <p className="text-zinc-400 max-w-2xl mx-auto mb-8 sm:mb-12 animate-in-slide-up animate-delay-300 text-sm sm:text-base">
                  Access ChatGPT and Gemini with a single click, manage tasks, and organize notes all in one powerful
                  workspace
                </p>

                <div className="flex flex-col sm:flex-row gap-4 animate-in-slide-up animate-delay-400">
                  <Link
                    href="/login"
                    className="border border-zinc-700 px-8 py-3 text-sm hover:bg-zinc-900 transition-all duration-300 flex items-center group hover:border-teal-500 hover:text-teal-500 relative overflow-hidden"
                  >
                    <span className="relative z-10">
                      Start Chatting{" "}
                      <ArrowRight className="ml-2 h-4 w-4 inline transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </section>

        {/* How We Work Section - Features */}
        <section ref={featuresRef} id="features">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-24">
            <div className="max-w-6xl mx-auto text-center mb-16">
              <div className="inline-block mb-4 animate-in-scale" data-animate="scale">
                <div className="h-10 w-10 bg-zinc-800 mx-auto mb-4 relative overflow-hidden group-hover:border-teal-500">
                  <div className="absolute inset-0 opacity-0 animate-shimmer"></div>
                </div>
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold mb-4 animate-in-slide-up animate-delay-100"
                data-animate="slide-up"
              >
                Unified AI <span className="text-zinc-500">Experience</span>
              </h2>
              <p
                className="text-zinc-400 max-w-2xl mx-auto animate-in-slide-up animate-delay-200"
                data-animate="slide-up"
              >
                Switch between ChatGPT and Gemini with a single click while managing your tasks and notes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="border border-zinc-800 p-8 relative transition-all duration-300 hover:border-teal-500/50 hover:bg-zinc-900/30 animate-in-slide-left animate-delay-300"
                data-animate="slide-left"
              >
                <div className="absolute -top-4 -left-4 bg-[#050505] px-3 py-1 text-xl font-bold">01</div>
                <h3 className="text-xl font-bold mb-4 animate-in-slide-up animate-delay-200" data-animate="slide-up">
                  Switch AI Models
                </h3>
                <p className="text-zinc-400 mb-12">
                  Instantly toggle between ChatGPT and Gemini to leverage the unique strengths of each AI model
                </p>
                <div className="absolute bottom-6 right-6 transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-5 w-5 text-zinc-700" />
                </div>
              </div>

              <div
                className="border border-zinc-800 p-8 relative transition-all duration-300 hover:border-teal-500/50 hover:bg-zinc-900/30 animate-in-slide-up animate-delay-400"
                data-animate="slide-up"
              >
                <div className="absolute -top-4 -left-4 bg-[#050505] px-3 py-1 text-xl font-bold">02</div>
                <h3 className="text-xl font-bold mb-4 animate-in-slide-up animate-delay-200" data-animate="slide-up">
                  Chat & Create
                </h3>
                <p className="text-zinc-400 mb-12">
                  Have natural conversations with AI models and generate content, code, and creative ideas
                </p>
                <div className="absolute bottom-6 right-6 transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-5 w-5 text-zinc-700" />
                </div>
              </div>

              <div
                className="border border-zinc-800 p-8 relative transition-all duration-300 hover:border-teal-500/50 hover:bg-zinc-900/30 animate-in-slide-right animate-delay-500"
                data-animate="slide-right"
              >
                <div className="absolute -top-4 -left-4 bg-[#050505] px-3 py-1 text-xl font-bold">03</div>
                <h3 className="text-xl font-bold mb-4 animate-in-slide-up animate-delay-200" data-animate="slide-up">
                  Manage & Organize
                </h3>
                <p className="text-zinc-400 mb-12">
                  Turn AI insights into actionable tasks and organized notes with our integrated productivity tools
                </p>
                <div className="absolute bottom-6 right-6 transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-5 w-5 text-zinc-700" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Features Section - AI Models */}
        <section ref={aiModelsRef} id="ai-models">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-24">
            <div className="max-w-6xl mx-auto text-center mb-16">
              <div className="inline-block mb-4 animate-in-scale" data-animate="scale">
                <div className="h-10 w-10 bg-zinc-800 mx-auto mb-4"></div>
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold mb-4 animate-in-slide-up animate-delay-100"
                data-animate="slide-up"
              >
                Powerful <span className="text-zinc-500">Features</span>
              </h2>
              <p
                className="text-zinc-400 max-w-2xl mx-auto animate-in-slide-up animate-delay-200"
                data-animate="slide-up"
              >
                Our platform combines multiple AI models with productivity tools in one seamless experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="border border-zinc-800 p-8 transition-all duration-300 hover:border-teal-500/50 hover:bg-zinc-900/30 group animate-in-slide-up animate-delay-300"
                data-animate="slide-up"
              >
                <div className="h-12 w-12 bg-teal-900/30 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-teal-900/50">
                  <Sparkles className="h-6 w-6 text-teal-500" />
                </div>
                <h3 className="text-xl font-bold mb-4 animate-in-slide-up animate-delay-200" data-animate="slide-up">
                  One-Click AI Switching
                </h3>
                <p className="text-zinc-400">
                  Seamlessly toggle between ChatGPT and Gemini to get the best responses for different types of queries.
                </p>
              </div>

              <div
                className="border border-zinc-800 p-8 transition-all duration-300 hover:border-blue-500/50 hover:bg-zinc-900/30 group animate-in-slide-up animate-delay-400"
                data-animate="slide-up"
              >
                <div className="h-12 w-12 bg-blue-900/30 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-blue-900/50">
                  <span className="text-blue-500 text-xl">+</span>
                </div>
                <h3 className="text-xl font-bold mb-4 animate-in-slide-up animate-delay-200" data-animate="slide-up">
                  Integrated Task Manager
                </h3>
                <p className="text-zinc-400">
                  Create and organize tasks directly from your AI conversations with automatic priority sorting.
                </p>
              </div>

              <div
                className="border border-zinc-800 p-8 transition-all duration-300 hover:border-purple-500/50 hover:bg-zinc-900/30 group animate-in-slide-up animate-delay-500"
                data-animate="slide-up"
              >
                <div className="h-12 w-12 bg-purple-900/30 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-purple-900/50">
                  <span className="text-purple-500 text-xl">+</span>
                </div>
                <h3 className="text-xl font-bold mb-4 animate-in-slide-up animate-delay-200" data-animate="slide-up">
                  Smart Note Organization
                </h3>
                <p className="text-zinc-400">
                  Save and categorize important information from AI chats with intelligent tagging and search.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section ref={pricingRef} id="pricing">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-24">
            <div className="max-w-6xl mx-auto text-center mb-16">
              <h2
                className="text-4xl md:text-5xl font-bold mb-4 animate-in-slide-up animate-delay-100"
                data-animate="slide-up"
              >
                Simple pricing for <span className="text-zinc-500">all users</span>
              </h2>
              <p
                className="text-zinc-400 max-w-2xl mx-auto animate-in-slide-up animate-delay-100"
                data-animate="slide-up"
              >
                Access multiple AI models and productivity tools with our straightforward pricing plans
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Free Plan */}
              <div
                className="border border-zinc-800 p-8 transition-all duration-300 hover:border-teal-500/50 hover:bg-zinc-900/30 animate-in-slide-left animate-delay-200"
                data-animate="slide-left"
              >
                <div
                  className="mb-2 text-sm text-zinc-400 animate-in-slide-up animate-delay-200"
                  data-animate="slide-up"
                >
                  Free Plan
                </div>
                <div className="text-4xl font-bold mb-6 animate-in-slide-up animate-delay-300" data-animate="slide-up">
                  $0
                </div>
                <p className="text-zinc-400 mb-6">Basic access with limited messages</p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>10 messages per day</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>1 page note</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Basic AI model access</span>
                  </li>
                </ul>

                <Link
                  href="/register"
                  className="block text-center border border-zinc-700 py-3 w-full hover:bg-zinc-900 transition-all duration-300 hover:border-teal-500 hover:text-teal-500 relative overflow-hidden group"
                >
                  <span className="relative z-10">Sign Up Free</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
              </div>

              {/* Standard Plan */}
              <div
                className="border border-zinc-800 p-8 relative transition-all duration-300 hover:border-teal-500/50 hover:bg-zinc-900/30 animate-in-slide-up animate-delay-300"
                data-animate="slide-up"
              >
                <div className="absolute -top-3 left-0 right-0 mx-auto w-max px-4 py-1 bg-teal-500 text-black text-xs font-medium animate-pulse">
                  POPULAR
                </div>
                <div
                  className="mb-2 text-sm text-zinc-400 animate-in-slide-up animate-delay-200"
                  data-animate="slide-up"
                >
                  Standard Plan
                </div>
                <div className="text-4xl font-bold mb-6 animate-in-slide-up animate-delay-300" data-animate="slide-up">
                  $9.99<span className="text-xl font-normal">/mo</span>
                </div>
                <p className="text-zinc-400 mb-6">Enhanced access with more messages</p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>100 messages per day</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>3 page notes</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Access to all AI models</span>
                  </li>
                </ul>

                <Link
                  href="/register"
                  className="block text-center bg-white text-black py-3 w-full hover:bg-zinc-100 transition-colors relative overflow-hidden group"
                >
                  <span className="relative z-10">Get Started</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
              </div>

              {/* Premium Plan */}
              <div
                className="border border-zinc-800 p-8 transition-all duration-300 hover:border-teal-500/50 hover:bg-zinc-900/30 animate-in-slide-right animate-delay-400"
                data-animate="slide-right"
              >
                <div
                  className="mb-2 text-sm text-zinc-400 animate-in-slide-up animate-delay-200"
                  data-animate="slide-up"
                >
                  Premium Plan
                </div>
                <div className="text-4xl font-bold mb-6 animate-in-slide-up animate-delay-300" data-animate="slide-up">
                  $19.99<span className="text-xl font-normal">/mo</span>
                </div>
                <p className="text-zinc-400 mb-6">Unlimited access with premium features</p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Unlimited messages</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Unlimited page notes</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Priority access to newest AI models</span>
                  </li>
                </ul>

                <Link
                  href="/register"
                  className="block text-center border border-zinc-700 py-3 w-full hover:bg-zinc-900 transition-all duration-300 hover:border-teal-500 hover:text-teal-500 relative overflow-hidden group"
                >
                  <span className="relative z-10">Get Started</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-24">
            <div className="max-w-6xl mx-auto">
              <div
                className="border border-zinc-800 p-8 md:p-12 transition-all duration-500 hover:border-teal-500/30 animate-in-scale"
                data-animate="scale"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <div className="text-xs font-medium text-zinc-500 mb-4">JOIN OUR COMMUNITY</div>
                    <h3
                      className="text-3xl font-bold mb-4 animate-in-slide-up animate-delay-100"
                      data-animate="slide-up"
                    >
                      Get AI Updates & Tips
                    </h3>
                    <p className="text-zinc-400 mb-8">
                      Subscribe to receive the latest updates on AI models, productivity hacks,
                    </p>

                    <div className="space-y-4">
                      <NewsletterForm />
                    </div>
                  </div>

                  {/* Redesigned stats section */}
                  <div className="flex flex-col justify-center">
                    <div className="grid grid-cols-1 gap-6">
                      {/* User satisfaction card */}
                      <div className="border border-zinc-800 p-6 rounded-sm bg-zinc-900/30 relative overflow-hidden group hover:border-teal-500/50 transition-all duration-300">
                        <div
                          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-700 group-hover:h-1.5"
                          style={{ width: "95%" }}
                        ></div>
                        <div className="flex items-center mb-4">
                          <BarChart className="h-5 w-5 text-teal-500 mr-3 group-hover:scale-110 transition-transform" />
                          <h4 className="text-sm font-medium">User Satisfaction</h4>
                        </div>
                        <div className="flex items-end justify-between">
                          <div className="text-4xl font-bold text-white group-hover:text-teal-500 transition-colors">
                            95<span className="text-xl">%</span>
                          </div>
                          <div className="text-xs text-zinc-500">Based on 2,500+ reviews</div>
                        </div>
                      </div>

                      {/* Active users card */}
                      <div className="border border-zinc-800 p-6 rounded-sm bg-zinc-900/30 relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300">
                        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-teal-500 to-blue-500 w-full transition-all duration-700 group-hover:h-1.5"></div>
                        <div className="flex items-center mb-4">
                          <Users className="h-5 w-5 text-teal-500 mr-3 group-hover:scale-110 transition-transform" />
                          <h4 className="text-sm font-medium">Active Users</h4>
                        </div>
                        <div className="flex items-end justify-between">
                          <div className="text-4xl font-bold text-white group-hover:text-blue-500 transition-colors">
                            10,000<span className="text-xl">+</span>
                          </div>
                          <div className="text-xs text-zinc-500">Growing daily</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-24">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div
                  className="border border-zinc-800 p-8 transition-all duration-300 hover:border-teal-500/50 hover:bg-zinc-900/30 animate-in-slide-left"
                  data-animate="slide-left"
                >
                  <div className="grid grid-cols-3 gap-4 mb-12">
                    <div className="bg-zinc-900/70 h-16 flex items-center justify-center border border-zinc-800 hover:border-teal-500/50 transition-all duration-300 hover:bg-zinc-800/50">
                      <span className="font-medium">G</span>
                    </div>
                    <div className="bg-zinc-900/70 h-16 flex items-center justify-center border border-zinc-800 hover:border-teal-500/50 transition-all duration-300 hover:bg-zinc-800/50">
                      <span className="font-medium">C</span>
                    </div>
                    <div className="bg-zinc-900/70 h-16 flex items-center justify-center border border-zinc-800 hover:border-teal-500/50 transition-all duration-300 hover:bg-zinc-800/50">
                      <span className="font-medium">A</span>
                    </div>
                    <div className="bg-zinc-900/70 h-16 flex items-center justify-center border border-zinc-800 hover:border-teal-500/50 transition-all duration-300 hover:bg-zinc-800/50">
                      <span className="font-medium">M</span>
                    </div>
                    <div className="bg-zinc-900/70 h-16 flex items-center justify-center border border-zinc-800 hover:border-teal-500/50 transition-all duration-300 hover:bg-zinc-800/50">
                      <span className="font-medium">S</span>
                    </div>
                    <div className="bg-zinc-900/70 h-16 flex items-center justify-center border border-zinc-800 hover:border-teal-500/50 transition-all duration-300 hover:bg-zinc-800/50">
                      <span className="font-medium">T</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-4xl font-bold text-teal-500 mb-2 animate-pulse">10,000+</div>
                    <div className="text-sm text-zinc-400 mb-8">Active users worldwide</div>

                    <div className="border-t border-zinc-800 pt-6">
                      <div className="flex items-center justify-center mb-2">
                        <div className="text-xs text-teal-500 mr-2">User Satisfaction</div>
                      </div>
                      <div className="flex items-center justify-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="ml-2 text-sm">4.9/5</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="animate-in-slide-right" data-animate="slide-right">
                  <h2 className="text-4xl font-bold mb-4 animate-in-slide-up animate-delay-100" data-animate="slide-up">
                    Users love our unified AI platform
                  </h2>
                  <p className="text-zinc-400 mb-8">
                    Hear from people who have transformed their workflow with our ChatGPT and Gemini integration
                  </p>

                  <div className="bg-zinc-900/70 border border-zinc-800 p-6 mb-6 transition-all duration-300 hover:border-teal-500/50 hover:bg-zinc-900/50">
                    <div className="mb-4 text-teal-500">
                      <Quote className="h-6 w-6" />
                    </div>
                    <p className="text-zinc-300 mb-6">
                      "Having both ChatGPT and Gemini in one interface has been a game-changer. I can switch between
                      models instantly and organize all my AI-generated content in one place."
                    </p>
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-zinc-800 flex items-center justify-center mr-4 transition-all duration-300 hover:bg-teal-900/30">
                        <span className="text-xs">MK</span>
                      </div>
                      <div>
                        <div className="font-medium">Michael Kim</div>
                        <div className="text-xs text-zinc-500">Product Designer, Innovate Inc.</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-2">
                    <div className="h-2 w-2 bg-teal-500 rounded-full"></div>
                    <div className="h-2 w-2 bg-zinc-700 rounded-full"></div>
                    <div className="h-2 w-2 bg-zinc-700 rounded-full"></div>
                    <div className="h-2 w-2 bg-zinc-700 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Insights Section - Blog */}
        <section ref={blogRef} id="blog">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-24">
            <div className="max-w-6xl mx-auto text-center mb-16">
              <div className="inline-block mb-4 animate-in-scale" data-animate="scale">
                <div className="h-10 w-10 bg-zinc-800 mx-auto mb-4"></div>
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold mb-4 animate-in-slide-up animate-delay-100"
                data-animate="slide-up"
              >
                AI <span className="text-zinc-500">Insights</span>
              </h2>
              <p
                className="text-zinc-400 max-w-2xl mx-auto animate-in-slide-up animate-delay-200"
                data-animate="slide-up"
              >
                Stay updated with the latest AI developments and productivity tips from our experts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Blog Post 1 */}
              <div
                className="border border-zinc-800 overflow-hidden group transition-all duration-300 hover:border-teal-500/50 animate-in-slide-up animate-delay-300"
                data-animate="slide-up"
              >
                <div className="h-48 bg-gradient-to-br from-teal-900/30 to-zinc-900 flex items-center justify-center relative overflow-hidden">
                  <Square className="h-8 w-8 text-white transition-all duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="p-6">
                  <div className="inline-block bg-zinc-800 px-3 py-1 text-xs mb-4">ChatGPT</div>
                  <div className="text-sm text-zinc-500 mb-2">Apr 12, 2024</div>
                  <h3
                    className="text-xl font-bold mb-3 group-hover:text-teal-500 transition-colors animate-in-slide-up animate-delay-200"
                    data-animate="slide-up"
                  >
                    ChatGPT vs Gemini: A Detailed Comparison
                  </h3>
                  <p className="text-zinc-400 text-sm mb-4">
                    Explore the strengths and weaknesses of both AI models to know which one to use for different tasks.
                  </p>
                  <Link
                    href="/blog/chatgpt-vs-gemini"
                    className="flex items-center text-sm hover:text-teal-500 transition-colors group"
                  >
                    Read More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Blog Post 2 */}
              <div
                className="border border-zinc-800 overflow-hidden group transition-all duration-300 hover:border-purple-500/50 animate-in-slide-up animate-delay-400"
                data-animate="slide-up"
              >
                <div className="h-48 bg-gradient-to-br from-purple-900/30 to-zinc-900 flex items-center justify-center relative overflow-hidden">
                  <Square className="h-8 w-8 text-white transition-all duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="p-6">
                  <div className="inline-block bg-zinc-800 px-3 py-1 text-xs mb-4">Productivity</div>
                  <div className="text-sm text-zinc-500 mb-2">Apr 8, 2024</div>
                  <h3
                    className="text-xl font-bold mb-3 group-hover:text-purple-500 transition-colors animate-in-slide-up animate-delay-200"
                    data-animate="slide-up"
                  >
                    AI-Powered Task Management Techniques
                  </h3>
                  <p className="text-zinc-400 text-sm mb-4">
                    Learn how to use AI to organize your tasks, set priorities, and boost your productivity.
                  </p>
                  <Link
                    href="/blog/ai-task-management"
                    className="flex items-center text-sm hover:text-purple-500 transition-colors group"
                  >
                    Read More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Blog Post 3 */}
              <div
                className="border border-zinc-800 overflow-hidden group transition-all duration-300 hover:border-blue-500/50 animate-in-slide-up animate-delay-500"
                data-animate="slide-up"
              >
                <div className="h-48 bg-gradient-to-br from-blue-900/30 to-zinc-900 flex items-center justify-center relative overflow-hidden">
                  <Diamond className="h-8 w-8 text-white transition-all duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="p-6">
                  <div className="inline-block bg-zinc-800 px-3 py-1 text-xs mb-4">Tips</div>
                  <div className="text-sm text-zinc-500 mb-2">Apr 3, 2024</div>
                  <h3
                    className="text-xl font-bold mb-3 group-hover:text-blue-500 transition-colors animate-in-slide-up animate-delay-200"
                    data-animate="slide-up"
                  >
                    Mastering AI Note Organization
                  </h3>
                  <p className="text-zinc-400 text-sm mb-4">
                    Discover effective strategies for organizing and retrieving information from your AI conversations.
                  </p>
                  <Link
                    href="/blog/ai-note-organization"
                    className="flex items-center text-sm hover:text-blue-500 transition-colors group"
                  >
                    Read More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-12 animate-in-slide-up animate-delay-700" data-animate="slide-up">
              <Link
                href="/blog"
                className="border border-zinc-700 px-6 py-3 text-sm hover:bg-zinc-900 transition-all duration-300 flex items-center group hover:border-teal-500 hover:text-teal-500 relative overflow-hidden"
              >
                <span className="relative z-10">
                  View All Articles{" "}
                  <ArrowRight className="ml-2 h-4 w-4 inline transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-4 animate-in-slide-up" data-animate="slide-up">
                <span className="text-white">Frequently Asked</span> <span className="text-zinc-400">Questions</span>
              </h2>
              <p className="text-zinc-400 text-lg animate-in-slide-up animate-delay-100" data-animate="slide-up">
                Common questions about our AI platform and productivity tools
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {/* FAQ Item 1 */}
              <div
                className="border border-zinc-800 overflow-hidden transition-all duration-300 hover:border-teal-500/50 animate-in-slide-up animate-delay-200"
                data-animate="slide-up"
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset"
                  onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
                  aria-expanded={openFaq === 0}
                >
                  <span className="text-lg font-medium">How do I switch between ChatGPT and Gemini?</span>
                  <svg
                    className={`h-5 w-5 text-zinc-500 transition-transform duration-200 ${openFaq === 0 ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === 0 ? "max-h-96 p-6 pt-0" : "max-h-0"}`}
                >
                  <p className="text-zinc-400 pt-4 border-t border-zinc-800">
                    Switching between AI models is simple. In the chat interface, you'll find a model selector at the
                    top of the conversation. Click on it to toggle between ChatGPT and Gemini. Your conversation history
                    will be preserved when switching models.
                  </p>
                </div>
              </div>

              {/* FAQ Item 2 */}
              <div
                className="border border-zinc-800 overflow-hidden transition-all duration-300 hover:border-teal-500/50 animate-in-slide-up animate-delay-300"
                data-animate="slide-up"
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset"
                  onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                  aria-expanded={openFaq === 1}
                >
                  <span className="text-lg font-medium">Can I create tasks directly from AI conversations?</span>
                  <svg
                    className={`h-5 w-5 text-zinc-500 transition-transform duration-200 ${openFaq === 1 ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === 1 ? "max-h-96 p-6 pt-0" : "max-h-0"}`}
                >
                  <p className="text-zinc-400 pt-4 border-t border-zinc-800">
                    Yes! During any AI conversation, you can highlight text and use the "Create Task" option from the
                    context menu. Alternatively, you can use the slash command "/task" followed by your task description
                    to instantly create a new task item in your task manager.
                  </p>
                </div>
              </div>

              {/* FAQ Item 3 */}
              <div
                className="border border-zinc-800 overflow-hidden transition-all duration-300 hover:border-teal-500/50 animate-in-slide-up animate-delay-400"
                data-animate="slide-up"
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset"
                  onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                  aria-expanded={openFaq === 2}
                >
                  <span className="text-lg font-medium">How does the note organization system work?</span>
                  <svg
                    className={`h-5 w-5 text-zinc-500 transition-transform duration-200 ${openFaq === 2 ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === 2 ? "max-h-96 p-6 pt-0" : "max-h-0"}`}
                >
                  <p className="text-zinc-400 pt-4 border-t border-zinc-800">
                    Our note organization system uses AI-powered tagging and categorization. When you save information
                    from a chat, the system automatically suggests relevant tags. You can create custom folders, use
                    search filters, and even link related notes together. The system also supports markdown formatting
                    and code snippets.
                  </p>
                </div>
              </div>

              {/* FAQ Item 4 */}
              <div
                className="border border-zinc-800 overflow-hidden transition-all duration-300 hover:border-teal-500/50 animate-in-slide-up animate-delay-500"
                data-animate="slide-up"
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset"
                  onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                  aria-expanded={openFaq === 3}
                >
                  <span className="text-lg font-medium">Are my conversations with AI models private?</span>
                  <svg
                    className={`h-5 w-5 text-zinc-500 transition-transform duration-200 ${openFaq === 3 ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === 3 ? "max-h-96 p-6 pt-0" : "max-h-0"}`}
                >
                  <p className="text-zinc-400 pt-4 border-t border-zinc-800">
                    Yes, your conversations are private and encrypted. We do not use your conversations for training AI
                    models or share them with third parties. You can delete your conversation history at any time, and
                    we offer additional privacy controls in the settings menu.
                  </p>
                </div>
              </div>

              {/* FAQ Item 5 */}
              <div
                className="border border-zinc-800 overflow-hidden transition-all duration-300 hover:border-teal-500/50 animate-in-slide-up animate-delay-600"
                data-animate="slide-up"
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset"
                  onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                  aria-expanded={openFaq === 4}
                >
                  <span className="text-lg font-medium">Can I collaborate with team members on the platform?</span>
                  <svg
                    className={`h-5 w-5 text-zinc-500 transition-transform duration-200 ${openFaq === 4 ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === 4 ? "max-h-96 p-6 pt-0" : "max-h-0"}`}
                >
                  <p className="text-zinc-400 pt-4 border-t border-zinc-800">
                    Yes, our Premium plan includes team collaboration features. You can share AI conversations, tasks,
                    and notes with team members. The platform supports real-time collaboration, commenting, and
                    permission controls to manage access to shared content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Us Section */}
        <section ref={contactRef} id="contact">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-24">
            <div className="max-w-6xl mx-auto text-center mb-16">
              <div className="inline-block mb-4 animate-in-scale" data-animate="scale">
                <div className="h-10 w-10 bg-zinc-800 mx-auto mb-4"></div>
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold mb-4 animate-in-slide-up animate-delay-100"
                data-animate="slide-up"
              >
                Get in <span className="text-zinc-500">Touch</span>
              </h2>
              <p
                className="text-zinc-400 max-w-2xl mx-auto animate-in-slide-up animate-delay-200"
                data-animate="slide-up"
              >
                Have questions or feedback? We'd love to hear from you. Fill out the form below and we'll get back to
                you as soon as possible.
              </p>
            </div>

            <HomeContactForm />
          </div>
        </section>

        {/* Footer - Contact */}
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
                    <button
                      onClick={() => scrollToSection(featuresRef)}
                      className="text-zinc-500 text-sm hover:text-white transition-colors"
                    >
                      Features
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection(pricingRef)}
                      className="text-zinc-500 text-sm hover:text-white transition-colors"
                    >
                      Pricing
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection(aiModelsRef)}
                      className="text-zinc-500 text-sm hover:text-white transition-colors"
                    >
                      AI Models
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection(blogRef)}
                      className="text-zinc-500 text-sm hover:text-white transition-colors"
                    >
                      Blog
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection(contactRef)}
                      className="text-zinc-500 text-sm hover:text-white transition-colors"
                    >
                      Contact
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-4">Contact</h4>
                <ul className="space-y-2">
                  <li className="text-zinc-500 text-sm">hello.allais@gmail.com</li>
                  <li>
                    <a
                      href="https://x.com/allais_space"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 text-sm hover:text-white transition-colors"
                    >
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.producthunt.com/@allais_space"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 text-sm hover:text-white transition-colors"
                    >
                      ProductHunt
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/allais"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 text-sm hover:text-white transition-colors"
                    >
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://discord.gg/allais"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 text-sm hover:text-white transition-colors"
                    >
                      Discord
                    </a>
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

            <div className="border-t border-zinc-800 mt-12 pt-8">
              <div className="text-zinc-500 text-sm text-center">
                © {new Date().getFullYear()} Allais All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
