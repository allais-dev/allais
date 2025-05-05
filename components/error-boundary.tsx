"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-4 rounded-md bg-red-900/20 border border-red-800 text-red-100">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <details className="whitespace-pre-wrap text-sm">
            <summary className="cursor-pointer mb-2">Show error details</summary>
            <p className="mb-2">{this.state.error?.toString()}</p>
            <pre className="bg-black/30 p-2 rounded overflow-auto text-xs">{this.state.errorInfo?.componentStack}</pre>
          </details>
          <button
            className="mt-4 px-3 py-1 bg-red-800 hover:bg-red-700 rounded-md text-sm"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
