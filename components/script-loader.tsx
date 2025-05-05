"use client"

import Script from "next/script"

export function HighlightJsLoader() {
  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("highlight.js loaded")
        }}
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/javascript.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/typescript.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/python.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/bash.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/go.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/css.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/xml.min.js"
        strategy="afterInteractive"
      />

      <Script id="hljs-init" strategy="lazyOnload">
        {`
          document.addEventListener('DOMContentLoaded', () => {
            if (window.hljs) {
              window.hljs.configure({ ignoreUnescapedHTML: true });
              window.hljs.highlightAll();
              
              // Set up observer to highlight new code blocks
              const observer = new MutationObserver((mutations) => {
                if (window.hljs) {
                  window.hljs.highlightAll();
                }
              });
              
              // Start observing
              observer.observe(document.body, { 
                childList: true, 
                subtree: true 
              });
            } else {
              console.error('highlight.js not loaded');
            }
          });
        `}
      </Script>
    </>
  )
}
