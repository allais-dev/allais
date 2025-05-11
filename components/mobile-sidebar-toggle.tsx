"use client"

import { useEffect } from "react"

export function MobileSidebarToggle() {
  useEffect(() => {
    // Function to handle sidebar toggle
    const handleSidebarToggle = (e: MouseEvent) => {
      // Check if we're on mobile
      if (window.innerWidth > 767) return

      // Find the target element
      const target = e.target as HTMLElement

      // Check if the clicked element is the sidebar toggle button or its SVG child
      const isSidebarToggle =
        target.closest("button")?.querySelector('svg[width="18"]') !== null ||
        (target.tagName === "svg" && target.getAttribute("width") === "18")

      if (isSidebarToggle) {
        // Find the sidebar element
        const sidebar = document.querySelector(
          ".w-\\[60px\\].flex-shrink-0.border-r.border-\\[\\#333333\\].bg-\\[\\#141414\\].transition-all.duration-300.h-full.flex.flex-col.relative.overflow-hidden",
        )

        if (sidebar) {
          // Toggle the expanded class
          sidebar.classList.toggle("mobile-expanded")

          // If expanded, add a close button
          if (sidebar.classList.contains("mobile-expanded")) {
            // Create close button if it doesn't exist
            if (!sidebar.querySelector(".mobile-close-btn")) {
              const closeBtn = document.createElement("button")
              closeBtn.className = "mobile-close-btn"
              closeBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-x">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              `
              closeBtn.addEventListener("click", () => {
                sidebar.classList.remove("mobile-expanded")
              })
              sidebar.appendChild(closeBtn)
            } else {
              // Show existing close button
              const closeBtn = sidebar.querySelector(".mobile-close-btn") as HTMLElement
              if (closeBtn) closeBtn.style.display = "flex"
            }
          }
        }
      }
    }

    // Add event listener to the document
    document.addEventListener("click", handleSidebarToggle)

    // Cleanup
    return () => {
      document.removeEventListener("click", handleSidebarToggle)
    }
  }, [])

  return null // This component doesn't render anything
}
