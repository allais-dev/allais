"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/auth-provider"

export function DirectDbTest() {
  const [result, setResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const { user } = useAuth()

  // Test direct database update with simple data
  const testDirectUpdate = async () => {
    if (!user) {
      setError("User not logged in")
      return
    }

    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      // Create a test page with minimal data
      const testPage = {
        user_id: user.id,
        title: "Direct Test Page " + new Date().toISOString(),
        content: "Test content",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Try to insert the test page
      const { data: insertData, error: insertError } = await supabase.from("pages").insert([testPage]).select().single()

      if (insertError) {
        setError(`Insert error: ${insertError.message}`)
        console.error("Insert error:", insertError)
        return
      }

      setResult(`Successfully created test page with ID: ${insertData.id}`)

      // Now try to update the page with blocks data directly
      const testBlocks = [
        {
          id: crypto.randomUUID(),
          type: "text",
          content: "Test block content " + new Date().toISOString(),
        },
      ]

      // Direct update with explicit JSON stringification and parsing
      const { error: updateError } = await supabase
        .from("pages")
        .update({
          blocks: testBlocks, // Supabase should handle the JSON conversion
          updated_at: new Date().toISOString(),
        })
        .eq("id", insertData.id)
        .eq("user_id", user.id)

      if (updateError) {
        setError(`Update error: ${updateError.message}`)
        console.error("Update error:", updateError)
        return
      }

      setResult((prev) => `${prev}\nSuccessfully updated test page with blocks data`)

      // Now try to fetch the page to verify the data was saved
      const { data: fetchData, error: fetchError } = await supabase
        .from("pages")
        .select("*")
        .eq("id", insertData.id)
        .single()

      if (fetchError) {
        setError(`Fetch error: ${fetchError.message}`)
        console.error("Fetch error:", fetchError)
        return
      }

      // Check if blocks data was saved correctly
      setResult(
        (prev) =>
          `${prev}\nFetched page data: ${JSON.stringify({
            id: fetchData.id,
            title: fetchData.title,
            hasBlocks: !!fetchData.blocks,
            blocksType: typeof fetchData.blocks,
            blocksIsArray: Array.isArray(fetchData.blocks),
            blocksLength: Array.isArray(fetchData.blocks) ? fetchData.blocks.length : "N/A",
          })}`,
      )
    } catch (error) {
      setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
      console.error("Unexpected error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Test with explicit JSON stringification
  const testWithStringify = async () => {
    if (!user) {
      setError("User not logged in")
      return
    }

    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      // Create a test page with minimal data
      const testPage = {
        user_id: user.id,
        title: "Stringify Test Page " + new Date().toISOString(),
        content: "Test content",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Try to insert the test page
      const { data: insertData, error: insertError } = await supabase.from("pages").insert([testPage]).select().single()

      if (insertError) {
        setError(`Insert error: ${insertError.message}`)
        console.error("Insert error:", insertError)
        return
      }

      setResult(`Successfully created test page with ID: ${insertData.id}`)

      // Now try to update the page with blocks data using explicit JSON.stringify
      const testBlocks = [
        {
          id: crypto.randomUUID(),
          type: "text",
          content: "Test block content " + new Date().toISOString(),
        },
      ]

      // Convert blocks to a JSON string first
      const blocksJson = JSON.stringify(testBlocks)
      console.log("Stringified blocks:", blocksJson)

      // Then parse it back to ensure it's valid JSON
      const parsedBlocks = JSON.parse(blocksJson)
      console.log("Parsed blocks:", parsedBlocks)

      // Update with the parsed blocks
      const { error: updateError } = await supabase
        .from("pages")
        .update({
          blocks: parsedBlocks, // Use the parsed blocks
          updated_at: new Date().toISOString(),
        })
        .eq("id", insertData.id)
        .eq("user_id", user.id)

      if (updateError) {
        setError(`Update error: ${updateError.message}`)
        console.error("Update error:", updateError)
        return
      }

      setResult((prev) => `${prev}\nSuccessfully updated test page with stringified blocks data`)

      // Now try to fetch the page to verify the data was saved
      const { data: fetchData, error: fetchError } = await supabase
        .from("pages")
        .select("*")
        .eq("id", insertData.id)
        .single()

      if (fetchError) {
        setError(`Fetch error: ${fetchError.message}`)
        console.error("Fetch error:", fetchError)
        return
      }

      // Check if blocks data was saved correctly
      setResult(
        (prev) =>
          `${prev}\nFetched page data: ${JSON.stringify({
            id: fetchData.id,
            title: fetchData.title,
            hasBlocks: !!fetchData.blocks,
            blocksType: typeof fetchData.blocks,
            blocksIsArray: Array.isArray(fetchData.blocks),
            blocksLength: Array.isArray(fetchData.blocks) ? fetchData.blocks.length : "N/A",
          })}`,
      )
    } catch (error) {
      setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
      console.error("Unexpected error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Test with raw SQL query
  const testWithRawSQL = async () => {
    if (!user) {
      setError("User not logged in")
      return
    }

    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      // Create a test page with minimal data
      const testPage = {
        user_id: user.id,
        title: "SQL Test Page " + new Date().toISOString(),
        content: "Test content",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Try to insert the test page
      const { data: insertData, error: insertError } = await supabase.from("pages").insert([testPage]).select().single()

      if (insertError) {
        setError(`Insert error: ${insertError.message}`)
        console.error("Insert error:", insertError)
        return
      }

      setResult(`Successfully created test page with ID: ${insertData.id}`)

      // Now try to update the page with blocks data using a raw SQL query
      const testBlocks = [
        {
          id: crypto.randomUUID(),
          type: "text",
          content: "Test block content " + new Date().toISOString(),
        },
      ]

      // Convert blocks to a JSON string
      const blocksJson = JSON.stringify(testBlocks)

      // Use a raw SQL query to update the blocks
      const { error: updateError } = await supabase.rpc("update_page_blocks", {
        page_id: insertData.id,
        user_id: user.id,
        blocks_json: blocksJson,
      })

      if (updateError) {
        setError(`SQL Update error: ${updateError.message}`)
        console.error("SQL Update error:", updateError)

        // Try to create the function if it doesn't exist
        setResult((prev) => `${prev}\nAttempting to create SQL function...`)

        const createFunctionQuery = `
        CREATE OR REPLACE FUNCTION update_page_blocks(page_id UUID, user_id UUID, blocks_json JSONB)
        RETURNS VOID AS $$
        BEGIN
          UPDATE pages
          SET blocks = blocks_json,
              updated_at = NOW()
          WHERE id = page_id AND user_id = user_id;
        END;
        $$ LANGUAGE plpgsql;
        `

        const { error: createFunctionError } = await supabase.rpc("exec_sql", { sql: createFunctionQuery })

        if (createFunctionError) {
          setError(`Failed to create function: ${createFunctionError.message}`)
          console.error("Failed to create function:", createFunctionError)
          return
        }

        setResult((prev) => `${prev}\nSQL function created, trying update again...`)

        // Try the update again
        const { error: retryError } = await supabase.rpc("update_page_blocks", {
          page_id: insertData.id,
          user_id: user.id,
          blocks_json: blocksJson,
        })

        if (retryError) {
          setError(`Retry update error: ${retryError.message}`)
          console.error("Retry update error:", retryError)
          return
        }
      }

      setResult((prev) => `${prev}\nSuccessfully updated test page with SQL blocks data`)

      // Now try to fetch the page to verify the data was saved
      const { data: fetchData, error: fetchError } = await supabase
        .from("pages")
        .select("*")
        .eq("id", insertData.id)
        .single()

      if (fetchError) {
        setError(`Fetch error: ${fetchError.message}`)
        console.error("Fetch error:", fetchError)
        return
      }

      // Check if blocks data was saved correctly
      setResult(
        (prev) =>
          `${prev}\nFetched page data: ${JSON.stringify({
            id: fetchData.id,
            title: fetchData.title,
            hasBlocks: !!fetchData.blocks,
            blocksType: typeof fetchData.blocks,
            blocksIsArray: Array.isArray(fetchData.blocks),
            blocksLength: Array.isArray(fetchData.blocks) ? fetchData.blocks.length : "N/A",
          })}`,
      )
    } catch (error) {
      setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
      console.error("Unexpected error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Test with a simple update
  const testSimpleUpdate = async () => {
    if (!user) {
      setError("User not logged in")
      return
    }

    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      // Create a test page with minimal data
      const testPage = {
        user_id: user.id,
        title: "Simple Update Test " + new Date().toISOString(),
        content: "Test content",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Try to insert the test page
      const { data: insertData, error: insertError } = await supabase.from("pages").insert([testPage]).select().single()

      if (insertError) {
        setError(`Insert error: ${insertError.message}`)
        console.error("Insert error:", insertError)
        return
      }

      setResult(`Successfully created test page with ID: ${insertData.id}`)

      // Now try to update just the title
      const { error: updateError } = await supabase
        .from("pages")
        .update({
          title: "Updated Title " + new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", insertData.id)
        .eq("user_id", user.id)

      if (updateError) {
        setError(`Update error: ${updateError.message}`)
        console.error("Update error:", updateError)
        return
      }

      setResult((prev) => `${prev}\nSuccessfully updated test page title`)

      // Now try to fetch the page to verify the data was saved
      const { data: fetchData, error: fetchError } = await supabase
        .from("pages")
        .select("*")
        .eq("id", insertData.id)
        .single()

      if (fetchError) {
        setError(`Fetch error: ${fetchError.message}`)
        console.error("Fetch error:", fetchError)
        return
      }

      // Check if title was updated
      setResult(
        (prev) =>
          `${prev}\nFetched page data: ${JSON.stringify({
            id: fetchData.id,
            title: fetchData.title,
          })}`,
      )
    } catch (error) {
      setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
      console.error("Unexpected error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border border-gray-700 rounded-md bg-gray-900 mt-4">
      <h2 className="text-lg font-semibold mb-4">Direct Database Test</h2>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={testDirectUpdate} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            Test Direct Update
          </Button>

          <Button onClick={testWithStringify} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
            Test With Stringify
          </Button>

          <Button onClick={testWithRawSQL} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
            Test With Raw SQL
          </Button>

          <Button onClick={testSimpleUpdate} disabled={isLoading} className="bg-yellow-600 hover:bg-yellow-700">
            Test Simple Update
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-blue-500 animate-spin"></div>
            <span>Testing...</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-800 rounded-md text-red-300">
            <p className="font-semibold">Error:</p>
            <p className="whitespace-pre-wrap">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-3 bg-green-900/30 border border-green-800 rounded-md text-green-300">
            <p className="font-semibold">Result:</p>
            <p className="whitespace-pre-wrap">{result}</p>
          </div>
        )}
      </div>
    </div>
  )
}
