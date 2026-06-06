"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { parseNmapOutput } from "@/lib/parser"
import { sanitize } from "@/lib/sanitize"

export interface BulkImportFileResult {
  filename: string
  success: boolean
  id?: string
  error?: string
  nodeCount?: number
}

export async function bulkImportScans(
  formData: FormData
): Promise<BulkImportFileResult[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return [{ filename: "", success: false, error: "Not authenticated" }]

  const files = formData.getAll("files") as File[]
  if (files.length === 0)
    return [{ filename: "", success: false, error: "No files selected" }]

  const results: BulkImportFileResult[] = []

  for (const file of files) {
    try {
      const rawOutput = await sanitize(await file.text())
      const baseName =
        file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ").trim() || "Untitled"

      const parsed = parseNmapOutput(rawOutput)
      if (parsed.nodes.length === 0) {
        results.push({ filename: file.name, success: false, error: "No valid IPs found" })
        continue
      }

      let targetName = baseName
      let inserted = false

      for (let attempt = 0; attempt < 20; attempt++) {
        if (attempt > 0) targetName = `${baseName} (${attempt + 1})`

        const { data, error } = await supabase
          .from("scans")
          .insert({
            user_id: user.id,
            target_name: targetName,
            raw_output: rawOutput,
            parsed_data: { nodes: parsed.nodes, edges: parsed.edges },
            ai_report: null,
            tags: [],
          })
          .select("id")
          .single()

        if (!error) {
          results.push({
            filename: file.name,
            success: true,
            id: data.id,
            nodeCount: parsed.nodes.length,
          })
          inserted = true
          break
        }

        if (error.code === "23505") continue

        results.push({ filename: file.name, success: false, error: error.message })
        inserted = true
        break
      }

      if (!inserted) {
        results.push({
          filename: file.name,
          success: false,
          error: "Too many scans with similar name",
        })
      }
    } catch (e) {
      results.push({ filename: file.name, success: false, error: String(e) })
    }
  }

  revalidatePath("/dashboard")
  return results
}
