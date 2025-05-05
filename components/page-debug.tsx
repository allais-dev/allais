"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/auth-provider"

interface PageDebugProps {
  pageId: string
  title: string
  blocks: any[]
}

export function PageDebug({ pageId, title, blocks }: PageDebugProps) {
  const [result, setResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pageData, setPageData] = useState<any | null>(null)
  const [expanded, setExpanded] = useState(false)
  const supabase = createClientComponentClient()
  const { user } = useAuth()

  // Fetch current page data from database
  const fetchPageData = async () => {
    if (!user || !pageId) {
      setError("User not logged in or pageId not provided")
      return
    }

    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      const { data, error } = await supabase.from("pages").select("*").eq("id", pageId).eq("user_id", user.id).single()

      if (error) {
        setError(`Fetch error: ${error.message}`)
        console.error("Fetch error:", error)
        return
      }

      setPageData(data)
      setResult("Successfully fetched page data")
    } catch (error) {
      setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
      console.error("Unexpected error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Test direct update with title only
  const testTitleUpdate = async () => {
    if (!user || !pageId) {
      setError("User not logged in or pageId not provided")
      return
    }

    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      const { error } = await supabase
        .from("pages")
        .update({
          title: title + " (Debug Test)",
          updated_at: new Date().toISOString(),
        })
        .eq("id", pageId)
        .eq("user_id", user.id)

      if (error) {
        setError(`Update error: ${error.message}`)
        console.error("Update error:", error)
        return
      }

      setResult("Successfully updated page title")
      await fetchPageData()
    } catch (error) {
      setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
      console.error("Unexpected error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Test update with blocks data
  const testBlocksUpdate = async () => {
    if (!user || !pageId) {
      setError("User not logged in or pageId not provided")
      return
    }

    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      // Create a simplified version of blocks for testing
      const testBlocks = blocks.map((block) => ({
        id: block.id,
        type: block.type,
        content: block.type === "text" ? "Test content updated at " + new Date().toLocaleTimeString() : [],
      }))

      const blocksJson = JSON.stringify(testBlocks)
      console.log("Sending blocks update:", {
        blocks: testBlocks,
        blocksJSON: blocksJson,
      })

      // First try direct update
      const { error } = await supabase
        .from("pages")
        .update({
          blocks: testBlocks,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pageId)
        .eq("user_id", user.id)

      if (error) {
        setError(`Blocks update error: ${error.message}`)
        console.error("Blocks update error:", error)
        return
      }

      setResult("Successfully updated blocks data")

      // Verify the update immediately
      const { data: verifyData, error: verifyError } = await supabase
        .from("pages")
        .select("*")
        .eq("id", pageId)
        .single()

      if (verifyError) {
        setError(`Verification error: ${verifyError.message}`)
        console.error("Verification error:", verifyError)
        return
      }

      setResult(
        (prev) =>
          `${prev}
Verified update success: ${JSON.stringify({
            hasBlocks: !!verifyData.blocks,
            blocksCount: verifyData.blocks ? verifyData.blocks.length : 0,
            firstBlockContent:
              verifyData.blocks && verifyData.blocks.length > 0 ? verifyData.blocks[0].content : "None",
          })}`,
      )

      setPageData(verifyData)
    } catch (error) {
      setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
      console.error("Unexpected error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Check database schema
  const checkDatabaseSchema = async () => {
    if (!user) {
      setError("User not logged in")
      return
    }

    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      // This is a workaround to check the table structure
      // We'll create a test page and then check the error message if it fails
      const testPage = {
        user_id: user.id,
        title: "Schema Test " + new Date().toISOString(),
        content: "Test content",
        blocks: [{ id: "test", type: "text", content: "Test" }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("pages").insert([testPage]).select().single()

      if (error) {
        if (error.message.includes("column") || error.message.includes("type")) {
          setError(`Table structure issue: ${error.message}`)
        } else {
          setError(`Other error: ${error.message}`)
        }
        console.error("Structure test error:", error)
        return
      }

      setResult(`Table structure seems correct. Created test page with ID: ${data.id}`)
    } catch (error) {
      setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
      console.error("Unexpected error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Add a new function to force a page refresh from the database
  const forceRefreshPage = async () => {
    if (!user || !pageId) {
      setError("User not logged in or pageId not provided")
      return
    }

    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      // Fetch fresh page data
      const { data, error } = await supabase.from("pages").select("*").eq("id", pageId).eq("user_id", user.id).single()

      if (error) {
        setError(`Fetch error: ${error.message}`)
        console.error("Fetch error:", error)
        return
      }

      setPageData(data)
      setResult(`Page refreshed from database. Last updated at: ${new Date(data.updated_at).toLocaleTimeString()}`)

      // Refresh the page in the browser to force a complete reload
      if (confirm("Update successful. Reload the page to see changes?")) {
        window.location.reload()
      }
    } catch (error) {
      setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
      console.error("Unexpected error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Add a direct SQL function to bypass all layers and save directly to the database
  const forceSaveWithSQL = async () => {
    if (!user || !pageId) {
      setError("User not logged in or pageId not provided")
      return
    }

    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      // Get the blocks from the parent component
      const blocksJson = JSON.stringify(blocks)

      // Use a raw SQL query to save directly to the database
      const sqlQuery = `
      UPDATE pages
      SET 
        blocks = $1::jsonb,
        updated_at = NOW()
      WHERE 
        id = $2 
        AND user_id = $3
      RETURNING *
    `

      const { data, error } = await supabase.rpc("execute_sql", {
        query: sqlQuery,
        params: [blocksJson, pageId, user.id],
      })

      if (error) {
        // If the RPC function doesn't exist, create it
        if (error.message.includes("function") && error.message.includes("does not exist")) {
          setResult("Creating SQL execution function...")

          const createFunctionSql = `
          CREATE OR REPLACE FUNCTION execute_sql(query text, params jsonb)
          RETURNS jsonb AS $$
          DECLARE
            result jsonb;
          BEGIN
            EXECUTE query USING params->0, params->1, params->2 INTO result;
            RETURN result;
          EXCEPTION WHEN OTHERS THEN
            RAISE;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `

          const { error: createError } = await supabase.rpc("execute_sql", {
            query: createFunctionSql,
            params: [],
          })

          if (createError) {
            setError(`Failed to create SQL function: ${createError.message}`)
            return
          }

          // Try the update again
          setResult("Function created, trying update again...")
          const { data: retryData, error: retryError } = await supabase.rpc("execute_sql", {
            query: sqlQuery,
            params: [blocksJson, pageId, user.id],
          })

          if (retryError) {
            setError(`Retry SQL update failed: ${retryError.message}`)
            return
          }

          setResult("SQL update successful after creating function")
        } else {
          setError(`SQL update error: ${error.message}`)
          return
        }
      } else {
        setResult("SQL update successful")
      }

      // Verify the update by fetching the page
      const { data: verifyData, error: verifyError } = await supabase
        .from("pages")
        .select("*")
        .eq("id", pageId)
        .single()

      if (verifyError) {
        setError(`Verification error: ${verifyError.message}`)
        return
      }

      setPageData(verifyData)
      setResult(
        (prev) => `${prev}
Verified SQL update: Blocks count = ${verifyData.blocks ? verifyData.blocks.length : 0}`,
      )

      // Offer to reload the page
      if (confirm("SQL update successful. Reload the page to see changes?")) {
        window.location.reload()
      }
    } catch (error) {
      setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
      console.error("Unexpected error in SQL save:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-auto rounded-lg border border-red-800 bg-black p-4 text-xs shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white">Page Debug Panel</h3>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="h-6 w-6 p-0 text-white">
          {expanded ? "−" : "+"}
        </Button>
      </div>

      {expanded && (
        <>
          <div className="mb-4 space-y-2">
            <div className="rounded bg-gray-900 p-2">
              <h4 className="font-semibold text-gray-400">Page Info</h4>
              <div className="mt-1">
                <div>ID: {pageId}</div>
                <div>Title: {title}</div>
                <div>Blocks: {blocks.length}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={fetchPageData}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-xs h-7"
              >
                Fetch Page Data
              </Button>
              <Button
                onClick={testTitleUpdate}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-xs h-7"
              >
                Test Title Update
              </Button>
              <Button
                onClick={testBlocksUpdate}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-xs h-7"
              >
                Test Blocks Update
              </Button>
              <Button
                onClick={checkDatabaseSchema}
                disabled={isLoading}
                className="bg-yellow-600 hover:bg-yellow-700 text-xs h-7"
              >
                Check Schema
              </Button>
              <Button
                onClick={forceRefreshPage}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-xs h-7"
              >
                Force Refresh
              </Button>
              <Button
                onClick={forceSaveWithSQL}
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-xs h-7"
              >
                Force SQL Save
              </Button>
            </div>

            {isLoading && (
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full border-2 border-t-transparent border-blue-500 animate-spin"></div>
                <span>Testing...</span>
              </div>
            )}

            {error && (
              <div className="p-2 bg-red-900/30 border border-red-800 rounded-md text-red-300">
                <p className="font-semibold">Error:</p>
                <p className="whitespace-pre-wrap">{error}</p>
              </div>
            )}

            {result && (
              <div className="p-2 bg-green-900/30 border border-green-800 rounded-md text-green-300">
                <p className="font-semibold">Result:</p>
                <p className="whitespace-pre-wrap">{result}</p>
              </div>
            )}

            {pageData && (
              <div className="p-2 bg-blue-900/30 border border-blue-800 rounded-md text-blue-300">
                <p className="font-semibold">Database Data:</p>
                <div className="mt-1 space-y-1">
                  <div>ID: {pageData.id}</div>
                  <div>Title: {pageData.title}</div>
                  <div>Has Blocks: {pageData.blocks ? "Yes" : "No"}</div>
                  <div>Blocks Type: {pageData.blocks ? typeof pageData.blocks : "N/A"}</div>
                  <div>
                    Blocks Is Array: {pageData.blocks ? (Array.isArray(pageData.blocks) ? "Yes" : "No") : "N/A"}
                  </div>
                  <div>Updated At: {pageData.updated_at}</div>
                  <details>
                    <summary className="cursor-pointer text-blue-400">View Raw Data</summary>
                    <pre className="mt-2 p-2 bg-gray-900 rounded-md overflow-auto max-h-40">
                      {JSON.stringify(pageData, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-gray-400 text-xs">
            <p className="font-semibold">Debugging Tips:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Check if the blocks column exists in your database</li>
              <li>Verify the blocks column is of type JSONB</li>
              <li>Test if simple title updates work</li>
              <li>Check browser console for JavaScript errors</li>
              <li>Verify RLS policies allow updates</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
