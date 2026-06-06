import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsForm } from "@/components/forms/SettingsForm"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single()

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Settings</h1>
        <p className="mt-2 text-xs text-muted-foreground font-mono">
          Configure webhook notifications for new scans.
        </p>
      </div>

      <div className="border-2 border-border bg-card p-6">
        <div className="border-b-2 border-border -mx-6 -mt-6 mb-6 px-6 py-3">
          <span className="terminal-text text-xs font-bold uppercase tracking-wider text-amber">
            &gt; Notifications
          </span>
        </div>
        <SettingsForm
          webhookUrl={settings?.webhook_url || null}
          notifyOnScan={settings?.notify_on_scan ?? true}
        />
      </div>
    </div>
  )
}
