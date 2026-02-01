"use client"

import { useState, useRef, useEffect } from "react"
import type { ScanResultPayload } from "@/lib/n8n"

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

const PLACEHOLDER_REPLY =
  "Chat API isn't set up yet. Once you add POST /api/chat, I'll reply here."

const WEBHOOK_RESULT_KEY = "webhook-result-"

export interface ChatViewProps {
  /** When set, chat sends this with every message so the bot can use your report as context */
  executionId?: string | null
}

export function ChatView({ executionId }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reportContext, setReportContext] = useState<ScanResultPayload | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Load report context when opening chat from results (sessionStorage or API)
  useEffect(() => {
    if (!executionId?.trim() || typeof window === "undefined") return
    const key = WEBHOOK_RESULT_KEY + executionId.trim()
    const stored = sessionStorage.getItem(key)
    if (stored) {
      try {
        const result = JSON.parse(stored) as ScanResultPayload
        setReportContext(result)
        return
      } catch {
        // invalid, fall through to fetch
      }
    }
    fetch(`/api/results?executionId=${encodeURIComponent(executionId.trim())}`)
      .then((res) => res.json())
      .then((data: { result?: ScanResultPayload }) => {
        if (data?.result) setReportContext(data.result)
      })
      .catch(() => {})
  }, [executionId])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput("")
    setError(null)
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const body: { message: string; executionId?: string; reportContext?: ScanResultPayload } = { message: text }
      if (executionId?.trim()) body.executionId = executionId.trim()
      if (reportContext) body.reportContext = reportContext
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string }
      const replyText = res.ok ? (data.reply ?? PLACEHOLDER_REPLY) : (data.error ?? "Something went wrong.")
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: replyText,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: PLACEHOLDER_REPLY,
      }
      setMessages((prev) => [...prev, assistantMsg])
      setError("Couldn't send. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[600px] w-full max-w-md mx-auto">
      {/* Message list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            <p>{executionId ? (reportContext ? "Ask about your report. I have your checklist and summary." : "Loading your report…") : "Ask anything about your health or your scan."}</p>
            <p className="mt-1">This is not medical advice.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-muted-foreground">
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-center text-sm text-destructive px-4 pb-1">{error}</p>
      )}

      {/* Input */}
      <div className="p-4 pt-2 border-t border-border bg-background">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 min-h-[44px] max-h-32 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={loading}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="shrink-0 h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none hover:opacity-90 transition-opacity"
            aria-label="Send"
          >
            <svg
              className="w-5 h-5 rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          This is not medical advice. Consult your healthcare provider.
        </p>
      </div>
    </div>
  )
}
