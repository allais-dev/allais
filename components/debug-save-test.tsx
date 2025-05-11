"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/auth-provider"

export function DebugSaveTest() {
  const [result, setResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const { user } = useAuth()

  const testSimpleSave = async () => {
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
        title: "Test Page " + new Date().toISOString(),
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

      // Now try to update the page with blocks data
      const testBlocks = [
        {
          id: crypto.randomUUID(),
          type: "text",
          content: "Test block content " + new Date().toISOString(),
        },
      ]

      const { error: updateError } = await supabase
        .from("pages")
        .update({
          blocks: testBlocks,
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
      if (!fetchData.blocks || !Array.isArray(fetchData.blocks) || fetchData.blocks.length === 0) {
        setError("Blocks data was not saved correctly")
        console.error("Blocks data not saved:", fetchData)
        return
      }

      setResult((prev) => `${prev}\nVerified blocks data was saved correctly: ${JSON.stringify(fetchData.blocks)}`)
    } catch (error) {
      setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
      console.error("Unexpected error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkTableStructure = async () => {
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
        title: "Structure Test",
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

  const checkPermissions = async () => {
    if (!user) {
      setError("User not logged in")
      return
    }

    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      // Try to read from the pages table
      const { data: readData, error: readError } = await supabase
        .from("pages")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)

      if (readError) {
        setError(`Read permission error: ${readError.message}`)
        console.error("Read permission error:", readError)
        return
      }

      setResult("Read permission check passed")

      // Try to insert a test page
      const testPage = {
        user_id: user.id,
        title: "Permission Test",
        content: "Test content",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: insertData, error: insertError } = await supabase.from("pages").insert([testPage]).select().single()

      if (insertError) {
        setError(`Insert permission error: ${insertError.message}`)
        console.error("Insert permission error:", insertError)
        return
      }

      setResult((prev) => `${prev}\nInsert permission check passed`)

      // Try to update the test page
      const { error: updateError } = await supabase
        .from("pages")
        .update({
          title: "Permission Test Updated",
          updated_at: new Date().toISOString(),
        })
        .eq("id", insertData.id)
        .eq("user_id", user.id)

      if (updateError) {
        setError(`Update permission error: ${updateError.message}`)
        console.error("Update permission error:", updateError)
        return
      }

      setResult((prev) => `${prev}\nUpdate permission check passed`)

      // Try to delete the test page
      const { error: deleteError } = await supabase
        .from("pages")
        .delete()
        .eq("id", insertData.id)
        .eq("user_id", user.id)

      if (deleteError) {
        setError(`Delete permission error: ${deleteError.message}`)
        console.error("Delete permission error:", deleteError)
        return
      }

      setResult((prev) => `${prev}\nDelete permission check passed\nAll permission checks passed!`)
    } catch (error) {
      setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
      console.error("Unexpected error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border border-gray-700 rounded-md bg-gray-900 mt-4">
      <h2 className="text-lg font-semibold mb-4">Debug Save Test</h2>

      <div className="space-y-4">
        <div className="flex space-x-2">
          <Button onClick={testSimpleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            Test Simple Save
          </Button>

          <Button onClick={checkTableStructure} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
            Check Table Structure
          </Button>

          <Button onClick={checkPermissions} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
            Check Permissions
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
