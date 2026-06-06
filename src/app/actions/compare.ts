"use server"

import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { model } from "@/lib/ai/model"

export interface CompareResult {
  comparison?: string
  error?: string
}

export async function compareScans(
  scan1Id: string,
  scan2Id: string,
): Promise<CompareResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: scan1 } = await supabase
    .from("scans")
    .select("id, target_name, parsed_data, ai_report, user_id")
    .eq("id", scan1Id)
    .single()

  const { data: scan2 } = await supabase
    .from("scans")
    .select("id, target_name, parsed_data, ai_report, user_id")
    .eq("id", scan2Id)
    .single()

  if (!scan1 || !scan2) return { error: "One or both scans not found" }

  if (scan1.user_id !== user.id || scan2.user_id !== user.id) {
    return { error: "Access denied" }
  }

  try {
    const { text } = await generateText({
      model,
      prompt: `You are a network security analyst. Compare the following two network scans and provide a concise analysis.

Focus on:
1. Which scan has a larger attack surface (more IPs, more open ports)
2. Differences in exposed services
3. Critical vulnerabilities present in one but not the other
4. Overall security posture comparison
5. Actionable recommendations

Format your response in plain text with clear sections.

SCAN 1 — "${scan1.target_name}":
${JSON.stringify(scan1.parsed_data, null, 2)}
${scan1.ai_report ? `\nInitial analysis:\n${JSON.stringify(scan1.ai_report, null, 2)}` : ""}

SCAN 2 — "${scan2.target_name}":
${JSON.stringify(scan2.parsed_data, null, 2)}
${scan2.ai_report ? `\nInitial analysis:\n${JSON.stringify(scan2.ai_report, null, 2)}` : ""}`,
    })

    return { comparison: text }
  } catch {
    return { error: "AI comparison temporarily unavailable" }
  }
}
