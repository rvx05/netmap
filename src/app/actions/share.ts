"use server"

import { createClient } from "@/lib/supabase/server"

export interface CreateShareLinkResult {
  url?: string
  error?: string
}

export async function createShareLink(
  scanId: string,
  expiresInHours: number,
): Promise<CreateShareLinkResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: scan } = await supabase
    .from("scans")
    .select("id, user_id")
    .eq("id", scanId)
    .single()

  if (!scan) return { error: "Scan not found" }
  if (scan.user_id !== user.id) return { error: "Access denied" }

  const expiresAt = new Date(Date.now() + expiresInHours * 3600000).toISOString()

  const { data: token, error } = await supabase
    .from("share_tokens")
    .insert({ scan_id: scanId, expires_at: expiresAt })
    .select("token")
    .single()

  if (error) return { error: error.message }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  return { url: `${origin}/share/${token.token}` }
}
