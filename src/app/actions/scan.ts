"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { scanInputSchema, aiReportSchema } from "@/lib/schemas"
import { sanitize } from "@/lib/sanitize"
import { parseNmapOutput } from "@/lib/parser"
import { model } from "@/lib/ai/model"
import { rateLimit } from "@/lib/redis/rate-limit"
import { generateText } from "ai"

export async function createScan(
  prevState:
    | { error: string; field?: "targetName" | "rawOutput" | "general"; aiUnavailable?: boolean }
    | undefined,
  formData: FormData
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in", field: "general" as const }
  }

  const rawTargetName = formData.get("targetName") as string
  const rawOutput = formData.get("rawOutput") as string
  const rawTags = formData.get("tags") as string

  const parsed = scanInputSchema.safeParse({
    targetName: rawTargetName,
    rawOutput,
    tags: rawTags || undefined,
  })

  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return {
      error: first.message,
      field: (first.path[0] as "targetName" | "rawOutput") || "general",
    }
  }

  const sanitizedOutput = await sanitize(parsed.data.rawOutput)

  const parserResult = parseNmapOutput(sanitizedOutput)

  if (parserResult.nodes.length === 0) {
    return { error: "No valid IPs found", field: "rawOutput" as const }
  }

  // Rate limit check before AI call
  const { success: withinLimit } = await rateLimit.limit(user.id)

  let aiReport = null
  let aiError: string | null = null

  if (withinLimit) {
    try {
      const { text } = await generateText({
        model,
        prompt: `You are a network security analyst. Analyze the following parsed network scan data and return ONLY valid JSON — no markdown, no code fences, no explanation.

The JSON must match this structure:
{
  "attackPath": "plain-English explanation of the compromise sequence",
  "remediationCode": "copy-pasteable firewall or security rule",
  "codeType": "iptables" or "ufw" or "aws_sg" or "other"
}

Network Scan Data:
${JSON.stringify(parserResult, null, 2)}`,
      })

      const parsed = JSON.parse(text)
      const validated = aiReportSchema.parse(parsed)
      aiReport = validated
    } catch (err) {
      console.error("AI generation failed:", err)
      aiError = "AI analysis is currently at capacity, but your network map was generated successfully."
    }
  } else {
    aiError = "Rate limit reached. AI analysis will be available later."
  }

  const tags = parsed.data.tags
    ? parsed.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : []

  const { data: scan, error } = await supabase
    .from("scans")
    .insert({
      user_id: user.id,
      target_name: parsed.data.targetName,
      raw_output: sanitizedOutput,
      parsed_data: parserResult as unknown as Record<string, unknown>,
      ai_report: aiReport,
      tags,
    })
    .select()
    .single()

  if (error) {
    console.error("Supabase insert error:", error)
    if (error.code === "23505") {
      return { error: "A scan with this name already exists", field: "targetName" as const }
    }
    return { error: `Failed to save scan: ${error.message}`, field: "general" as const }
  }

  if (!scan) {
    return { error: "Scan saved but no data returned", field: "general" as const }
  }

  revalidatePath("/dashboard")

  try {
    const { data: settings } = await supabase
      .from("user_settings")
      .select("webhook_url, notify_on_scan")
      .eq("user_id", user.id)
      .single()

    if (settings?.webhook_url && settings?.notify_on_scan) {
      const highRiskEdges = parserResult.edges.filter((e) => e.isHighRisk)
      fetch(settings.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "scan_created",
          scanId: scan.id,
          targetName: parsed.data.targetName,
          nodeCount: parserResult.nodes.length,
          portCount: parserResult.edges.length,
          highRiskCount: highRiskEdges.length,
          url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/scan/${scan.id}`,
        }),
      }).catch(() => {})
    }
  } catch {}

  if (aiError) {
    redirect(`/dashboard/scan/${scan.id}?aiUnavailable=true`)
  }

  redirect(`/dashboard/scan/${scan.id}`)
}

export async function deleteScan(
  prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  const scanId = formData.get("scanId") as string
  if (!scanId) {
    return { error: "Scan ID is required" }
  }

  const { error } = await supabase
    .from("scans")
    .delete()
    .eq("id", scanId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Supabase delete error:", error)
    return { error: "Failed to delete scan" }
  }

  revalidatePath("/dashboard")
  return {}
}
