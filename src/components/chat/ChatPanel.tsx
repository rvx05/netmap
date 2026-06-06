"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

const SUGGESTIONS = [
  "What's the biggest vulnerability?",
  "How do I secure this network?",
  "Which ports should I close first?",
]

export function ChatPanel({
  scanId,
  initialMessages,
}: {
  scanId: string
  initialMessages: ChatMessage[]
}) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
      if (e.key === "c" && !open && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        setOpen(true)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open])

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || streaming) return
    setInput("")
    setError(null)

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: msg,
      created_at: new Date().toISOString(),
    }

    const tempAssistantMsg: ChatMessage = {
      id: `temp-${Date.now() + 1}`,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, tempUserMsg, tempAssistantMsg])
    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId, message: msg }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Request failed")
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const next = [...prev]
          const last = next[next.length - 1]
          if (last && last.role === "assistant" && last.id === tempAssistantMsg.id) {
            next[next.length - 1] = { ...last, content: accumulated }
          }
          return next
        })
      }

      setMessages((prev) => {
        const next = [...prev]
        const last = next[next.length - 1]
        if (last && last.role === "assistant" && last.id === tempAssistantMsg.id) {
          next[next.length - 1] = { ...last, content: accumulated, id: `done-${Date.now()}` }
        }
        return next
      })
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return
      setError("Failed to get response. Try again.")
      setMessages((prev) => prev.slice(0, -2))
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }, [input, streaming, scanId])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center border-2 border-amber bg-black text-amber transition-colors hover:bg-amber/20"
          title="Chat about this scan (C)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
      )}

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-full md:max-w-md flex-col border-l-2 border-amber/30 bg-card">
            <div className="flex items-center justify-between border-b-2 border-amber/30 bg-amber/[0.03] px-5 py-3">
              <span className="terminal-text text-xs font-bold uppercase tracking-wider text-amber">
                &gt; Chat
              </span>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={() => {
                      const text = messages
                        .map((m) => `**${m.role === "user" ? "You" : "AI"}**: ${m.content}`)
                        .join("\n\n")
                      const blob = new Blob([text], { type: "text/markdown" })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `chat-${scanId.slice(0, 8)}.md`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    className="terminal-text text-xs text-muted-foreground hover:text-amber transition-colors"
                    title="Export chat"
                  >
                    Export
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground hover:text-amber transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {messages.length === 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-center text-xs text-muted-foreground font-mono">
                    Ask a question about this scan.
                  </p>
                  <div className="flex flex-col gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        disabled={streaming}
                        className="border border-border px-4 py-2.5 text-left text-xs text-muted-foreground font-mono transition-colors hover:border-amber/50 hover:text-amber disabled:opacity-40"
                      >
                        $ {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "user" ? (
                    <div className="max-w-[85%] border-2 border-amber bg-amber/10 px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap font-mono text-amber">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="max-w-[85%] border-2 border-cyan bg-cyan/[0.08] px-4 py-2.5 text-sm leading-relaxed text-foreground">
                      {msg.content ? (
                        <MarkdownRenderer content={msg.content} />
                      ) : (
                        <span className="text-muted-foreground animate-pulse">▊</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {error && (
                <p className="text-center text-xs text-high-risk">{error}</p>
              )}
            </div>

            <div className="border-t-2 border-amber/30 px-5 py-4">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="$ ask a question..."
                  rows={1}
                  disabled={streaming}
                  className="min-h-[38px] flex-1 resize-none border-2 border-border bg-muted px-3 py-2 text-sm text-foreground font-mono placeholder:text-muted-foreground outline-none focus:border-amber disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || streaming}
                  className="flex h-[38px] w-[38px] shrink-0 items-center justify-center border-2 border-amber bg-amber/10 text-amber transition-colors hover:bg-amber/20 disabled:opacity-40"
                >
                  {streaming ? (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber border-t-transparent" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
