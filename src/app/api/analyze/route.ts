import { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { generateText } from "ai"
import { model } from "@/lib/ai/model"
import { aiReportSchema } from "@/lib/schemas"
import { rateLimit } from "@/lib/redis/rate-limit"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const scanId = body.scanId as string | undefined
  if (!scanId) {
    return Response.json({ error: "scanId is required" }, { status: 400 })
  }

  const { data: scan } = await supabase
    .from("scans")
    .select("*")
    .eq("id", scanId)
    .single()

  if (!scan) {
    return Response.json({ error: "Scan not found" }, { status: 404 })
  }

  if (scan.ai_report) {
    return Response.json({ aiReport: scan.ai_report })
  }

  const { success: withinLimit } = await rateLimit.limit(user.id)
  if (!withinLimit) {
    return Response.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    )
  }

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
${JSON.stringify(scan.parsed_data, null, 2)}`,
    })

    const parsed = JSON.parse(text)
    const validated = aiReportSchema.parse(parsed)

    const { error: updateError } = await supabase
      .from("scans")
      .update({ ai_report: validated as unknown as Record<string, unknown> })
      .eq("id", scanId)

    if (updateError) {
      console.error("Failed to update scan with AI report:", updateError)
      return Response.json(
        { error: "AI analysis complete but failed to save" },
        { status: 500 }
      )
    }

    return Response.json({ aiReport: validated })
  } catch (err) {
    console.error("AI generation failed:", err)
    return Response.json(
      { error: "AI analysis temporarily unavailable" },
      { status: 503 }
    )
  }
}
