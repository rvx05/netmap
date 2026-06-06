"use client"

import { useActionState } from "react"
import { login } from "@/app/actions/auth"

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Terminal Panel */}
      <div className="hidden w-1/2 border-r-2 border-border bg-card p-12 lg:flex lg:flex-col">
        <div className="mb-8 flex items-center gap-2">
          <span className="terminal-text text-xl text-amber">&gt;_</span>
          <span className="text-sm font-bold tracking-wider uppercase text-foreground">
            NetMap AI
          </span>
        </div>
        <div className="terminal-text flex-1 space-y-2 text-sm text-muted-foreground">
          <p className="text-amber">&gt; Scanning session initialized...</p>
          <p>&gt; Target: internal-network.local</p>
          <p>&gt; Scanning 192.168.1.0/24...</p>
          <p>&gt; Host 192.168.1.1 (gateway): 5 ports open</p>
          <p>&gt;   Port 22 (ssh) — OpenSSH 8.9p1</p>
          <p className="text-high-risk">&gt;   Port 3389 (ms-wbt-server) — HIGH RISK</p>
          <p>&gt; Host 192.168.1.10 (web-server): 3 ports open</p>
          <p>&gt;   Port 80 (http) — Apache 2.4.49</p>
          <p className="text-high-risk">&gt;   Port 445 (microsoft-ds) — HIGH RISK</p>
          <p>&gt; Topology generated. AI analysis complete.</p>
          <p className="mt-4 text-cyan">&gt; Ready. Sign in to view results.</p>
          <p className="terminal-cursor">&nbsp;</p>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex w-full items-center justify-center p-6 md:p-8 lg:w-1/2">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Sign In</h1>
          <p className="mt-2 text-sm text-muted-foreground tracking-wide">
            Access your network workspace.
          </p>

          <form action={action} className="mt-8 space-y-5">
            {state?.error && (
              <p className="terminal-text text-xs text-high-risk">&gt; {state.error}</p>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full border-2 border-border bg-background px-4 py-3 text-sm text-foreground transition-all amber-glow-border focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full border-2 border-border bg-background px-4 py-3 text-sm text-foreground transition-all amber-glow-border focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full border-2 border-amber bg-amber/10 px-6 py-3 text-xs font-bold uppercase tracking-wider text-amber transition-all hover:bg-amber hover:text-black disabled:opacity-50 whitespace-nowrap"
            >
              {pending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="font-bold text-amber hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
