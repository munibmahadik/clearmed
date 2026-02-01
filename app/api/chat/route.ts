import { NextResponse } from "next/server"
import {
  getWebhookCachedResult,
  getScanResult,
  type ScanResultPayload,
} from "@/lib/n8n"

const SYSTEM_PROMPT = `You are a friendly health assistant for ClearMed. You help users understand their doctor's notes and health information in plain language.

Rules:
- Use simple, 6th-grade reading level. Be warm and supportive.
- Do NOT diagnose, prescribe, or give medical advice. Always say "consult your healthcare provider" for medical decisions.
- If the user shares scan results (checklist/summary), you may refer to them to explain terms or answer follow-up questions.
- Keep replies concise (a few short paragraphs max).`

function formatScanContext(payload: ScanResultPayload): string {
  const parts: string[] = []
  if (payload.summary) parts.push(`Summary: ${payload.summary}`)
  if (payload.checklist?.length) {
    parts.push(
      "Checklist: " +
        payload.checklist.map((c) => `${c.text} (${c.checked ? "done" : "todo"})`).join("; ")
    )
  }
  return parts.length ? parts.join("\n") : ""
}

/**
 * POST /api/chat
 * Body: { message: string, executionId?: string }
 * Returns: { reply: string } or { error: string }
 * Uses OPENAI_API_KEY. Optional executionId loads last scan as context.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const message = typeof body.message === "string" ? body.message.trim() : ""
    const executionId = typeof body.executionId === "string" ? body.executionId.trim() || undefined : undefined

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        reply:
          "Chat is not configured. Add OPENAI_API_KEY to .env.local to enable replies.",
      })
    }

    let contextBlock = ""
    if (executionId) {
      const scan =
        executionId.startsWith("wh-")
          ? getWebhookCachedResult(executionId)
          : await getScanResult(executionId)
      if (scan) {
        const formatted = formatScanContext(scan)
        if (formatted) {
          contextBlock = `\n\nUser's last scan (for context only):\n${formatted}\n`
        }
      }
    }

    const userContent = contextBlock
      ? `${contextBlock}\n\nUser message: ${message}`
      : message

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        max_tokens: 512,
      }),
    })

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } }
      const errMsg = err?.error?.message ?? `OpenAI error (${res.status})`
      return NextResponse.json({ error: errMsg }, { status: res.status >= 500 ? 502 : 400 })
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const reply =
      data.choices?.[0]?.message?.content?.trim() ??
      "I couldn't generate a reply. Please try again."

    return NextResponse.json({ reply })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
