import { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { streamText, type ModelMessage, type UserModelMessage, type AssistantModelMessage } from "ai"
import { model } from "@/lib/ai/model"

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
  const { scanId, message } = body as { scanId: string; message: string }
  if (!scanId || !message) {
    return Response.json({ error: "scanId and message are required" }, { status: 400 })
  }

  const { data: scan } = await supabase
    .from("scans")
    .select("*")
    .eq("id", scanId)
    .single()

  if (!scan) {
    return Response.json({ error: "Scan not found" }, { status: 404 })
  }

  if (scan.user_id !== user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const { error: saveError } = await supabase.from("chat_messages").insert({
    scan_id: scanId,
    user_id: user.id,
    role: "user",
    content: message,
  })

  if (saveError) {
    return Response.json({ error: "Failed to save message" }, { status: 500 })
  }

  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("scan_id", scanId)
    .order("created_at", { ascending: true })
    .limit(30)

  const systemPrompt = `You are a network security assistant. You have access to the results of a network scan. Answer questions about the scan data, vulnerabilities, and remediation steps. Be specific and reference actual IPs and ports from the scan data. Keep responses concise and technical.

Scan Data:
${JSON.stringify(scan.parsed_data, null, 2)}

${scan.ai_report ? `Initial Analysis:\n${JSON.stringify(scan.ai_report, null, 2)}` : ""}`

  const messages: ModelMessage[] = [
    { role: "system", content: systemPrompt } satisfies ModelMessage,
    ...(history || []).map((m): UserModelMessage | AssistantModelMessage => ({
      role: (["user", "assistant"].includes(m.role) ? m.role : "user") as "user" | "assistant",
      content: m.content,
    })),
  ]

  try {
    const result = streamText({
      model,
      messages,
      onFinish: async ({ text }) => {
        await supabase.from("chat_messages").insert({
          scan_id: scanId,
          user_id: user.id,
          role: "assistant",
          content: text,
        })
      },
    })

    return result.toTextStreamResponse()
  } catch (err) {
    console.error("Chat stream failed:", err)
    return Response.json({ error: "AI temporarily unavailable" }, { status: 503 })
  }
}
