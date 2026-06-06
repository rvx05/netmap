"use client"

import { useState, useEffect } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import type { AiReport } from "@/types"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"

const codeTypeLabels: Record<string, string> = {
  iptables: "iptables",
  ufw: "UFW",
  aws_sg: "AWS Security Group",
  other: "Other",
}

export function RemediationCodeBlock({ aiReport }: { aiReport: AiReport }) {
  const [copied, setCopied] = useState(false)
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(aiReport.remediationCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between border-b-2 border-amber/30 bg-amber/[0.03] px-4 py-2 -mx-5 -mt-5 mb-4">
          <span className="terminal-text text-xs font-bold uppercase tracking-wider text-amber">
            &gt; Attack Path
          </span>
        </div>
        <div className="border-2 border-border bg-muted px-4 py-3 text-sm leading-relaxed text-foreground">
          <MarkdownRenderer content={aiReport.attackPath} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between border-b-2 border-amber/30 bg-amber/[0.03] px-4 py-2 -mx-5 -mt-1 mb-4">
          <span className="terminal-text text-xs font-bold uppercase tracking-wider text-amber">
            &gt; Remediation — {codeTypeLabels[aiReport.codeType] || aiReport.codeType}
          </span>
          <button
            onClick={handleCopy}
            className="terminal-text text-xs text-muted-foreground hover:text-amber transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="border-2 border-border overflow-hidden">
          <SyntaxHighlighter
            language={
              aiReport.codeType === "iptables" || aiReport.codeType === "ufw"
                ? "bash"
                : "json"
            }
            style={isDark ? atomDark : oneLight}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: "0.8125rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {aiReport.remediationCode}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  )
}
