"use client"

import { useActionState } from "react"
import { signup } from "@/app/actions/auth"

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined)

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
          <p className="text-amber">&gt; Initializing new workspace...</p>
          <p>&gt; Creating secure environment...</p>
          <p>&gt; Generating API credentials...</p>
          <p>&gt; Configuring AI analysis pipeline...</p>
          <p>&gt; Setting up RLS policies...</p>
          <p className="mt-4 text-cyan">&gt; Ready. Complete registration to begin.</p>
          <p className="terminal-cursor">&nbsp;</p>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex w-full items-center justify-center p-6 md:p-8 lg:w-1/2">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Create Account</h1>
          <p className="mt-2 text-sm text-muted-foreground tracking-wide">
            Start mapping your network in seconds.
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
                minLength={8}
                className="block w-full border-2 border-border bg-background px-4 py-3 text-sm text-foreground transition-all amber-glow-border focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">Min 8 characters</p>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full border-2 border-amber bg-amber/10 px-6 py-3 text-xs font-bold uppercase tracking-wider text-amber transition-all hover:bg-amber hover:text-black disabled:opacity-50 whitespace-nowrap"
            >
              {pending ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="font-bold text-amber hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
