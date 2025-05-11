// Debug utility to help track database operations
export const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEBUG] ${message}`, data || "")
  }
}
