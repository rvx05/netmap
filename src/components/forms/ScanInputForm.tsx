"use client"

import { useActionState } from "react"
import { createScan } from "@/app/actions/scan"

export function ScanInputForm() {
  const [state, action, pending] = useActionState(createScan, undefined)

  return (
    <form action={action} className="space-y-5">
      <div>
        <label
          htmlFor="targetName"
          className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground"
        >
          Scan Name
        </label>
        <input
          type="text"
          name="targetName"
          id="targetName"
          placeholder="e.g. Internal Network Scan"
          className="block w-full border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all amber-glow-border focus:outline-none"
        />
        {state?.field === "targetName" && (
          <p className="mt-1 text-xs text-high-risk terminal-text">
            &gt; {state.error}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="rawOutput"
          className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground"
        >
          Raw Nmap Output
        </label>
        <textarea
          name="rawOutput"
          id="rawOutput"
          rows={12}
          placeholder="Paste your Nmap scan output here..."
          className="terminal-text block w-full border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all amber-glow-border focus:outline-none"
        />
        {state?.field === "rawOutput" && (
          <p className="mt-1 text-xs text-high-risk terminal-text">
            &gt; {state.error}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="tags"
          className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground"
        >
          Tags (optional)
        </label>
        <input
          type="text"
          name="tags"
          id="tags"
          placeholder="production, home-lab, critical"
          className="block w-full border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all amber-glow-border focus:outline-none"
        />
      </div>

      {state?.field === "general" && (
        <p className="terminal-text text-xs text-high-risk">&gt; {state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="border-2 border-amber bg-amber/10 px-8 py-3 text-xs font-bold uppercase tracking-widest text-amber transition-all hover:bg-amber hover:text-black disabled:opacity-50"
      >
        {pending ? "Analyzing..." : "Submit Scan"}
      </button>
    </form>
  )
}
