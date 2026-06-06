import Link from "next/link"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background bg-grid">
      {/* Nav */}
      <nav className="flex items-center justify-between border-b-2 border-border px-4 md:px-8 py-4">
        <div className="flex items-center gap-2">
          <span className="terminal-text text-xl text-amber">&gt;_</span>
          <span className="text-sm font-bold tracking-wider uppercase text-foreground">
            NetMap AI
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-5 md:px-8 py-2 text-xs font-bold uppercase tracking-wider text-foreground border-2 border-border hover:border-amber transition-all whitespace-nowrap"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-5 md:px-8 py-2 text-xs font-bold uppercase tracking-wider text-amber border-2 border-amber bg-amber/10 hover:bg-amber hover:text-black transition-all whitespace-nowrap"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 items-center justify-center px-4 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-block border-2 border-amber px-4 py-1.5">
            <span className="terminal-text text-[10px] font-bold uppercase tracking-[0.2em] text-amber">
              AI-Powered Network Reconnaissance
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tight text-foreground">
            Map your network.
            <br />
            <span className="text-amber">Fix the gaps.</span>
          </h1>

          <div className="mt-6 flex justify-center">
            <div className="terminal-text inline-block border-2 border-border bg-card px-4 md:px-6 py-4 text-left text-sm text-muted-foreground">
              <p>
                &gt; _<span className="terminal-cursor"></span>
              </p>
              <p className="mt-1">
                &gt; Paste raw Nmap output. Get an instant topology map,
              </p>
              <p>
                &gt; AI-powered attack path analysis, and remediation code.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto border-2 border-amber bg-amber/10 px-8 md:px-10 py-4 text-sm font-bold uppercase tracking-widest text-amber transition-all hover:bg-amber hover:text-black text-center"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto border-2 border-border px-8 md:px-10 py-4 text-sm font-bold uppercase tracking-widest text-foreground transition-all hover:border-amber/50 text-center"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 border-t-2 border-border pt-10">
            {[
              ["Zero Cost", "Free-tier LLM, no credit card"],
              ["Instant Visualization", "Paste → Map in seconds"],
              ["AI Remediation", "Copy-pasteable firewall rules"],
            ].map(([stat, desc]) => (
              <div key={stat}>
                <p className="text-sm font-bold uppercase tracking-wider text-amber">
                  {stat}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
