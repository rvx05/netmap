"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function saveSettings(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const webhookUrl = formData.get("webhookUrl") as string
  const notifyOnScan = formData.get("notifyOnScan") === "on"

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      webhook_url: webhookUrl.trim() || null,
      notify_on_scan: notifyOnScan,
    },
    { onConflict: "user_id" },
  )

  if (error) return { error: error.message }

  revalidatePath("/dashboard/settings")
  return { success: true }
}
