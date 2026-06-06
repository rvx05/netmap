"use client"

import { useActionState } from "react"
import { saveSettings } from "@/app/actions/settings"

export function SettingsForm({
  webhookUrl,
  notifyOnScan,
}: {
  webhookUrl: string | null
  notifyOnScan: boolean
}) {
  const [state, action, pending] = useActionState(saveSettings, undefined)

  return (
    <form action={action} className="space-y-6">
      <div>
        <label
          htmlFor="webhookUrl"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground"
        >
          Webhook URL
        </label>
        <input
          type="url"
          name="webhookUrl"
          id="webhookUrl"
          defaultValue={webhookUrl || ""}
          placeholder="https://hooks.example.com/netmap"
          className="block w-full border-2 border-border bg-muted px-4 py-2.5 text-sm text-foreground font-mono placeholder:text-muted-foreground outline-none focus:border-amber"
        />
        <p className="mt-2 text-xs text-muted-foreground font-mono">
          Receives a POST request with scan details after each new scan.
        </p>
      </div>

      <label className="flex cursor-pointer items-center gap-3 border-2 border-border bg-muted px-4 py-3">
        <input
          type="checkbox"
          name="notifyOnScan"
          defaultChecked={notifyOnScan}
          className="h-4 w-4 accent-amber"
        />
        <span className="text-sm font-mono text-foreground">Notify on every new scan</span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="border-2 border-amber bg-amber/10 px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-amber transition-colors hover:bg-amber/20 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save Settings"}
      </button>

      {state?.error && (
        <p className="text-sm text-high-risk font-mono">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-amber font-mono">Settings saved.</p>
      )}
    </form>
  )
}
