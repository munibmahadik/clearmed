import { NextResponse } from "next/server"
import {
  getWebhookCachedResult,
  getScanResult,
  type ScanResultPayload,
} from "@/lib/n8n"
import { getIcd10GmReference } from "@/lib/icd10gm"

const SYSTEM_PROMPT_BASE = `You are a friendly health assistant for ClearMed. You help users understand their doctor's notes and health information in plain language.

Rules:
- Use simple, 6th-grade reading level. Be warm and supportive.
- Do NOT diagnose, prescribe, or give medical advice. Always say "consult your healthcare provider" for medical decisions.
- When the user's message includes their scan/report context, use it to answer. If they ask "what did the doctor say", "what's in the note", "summarize", or similar, give a direct summary from that context—do not ask them to share details.
- If the user shares scan results (checklist/summary) in the message, refer to them to explain terms or answer follow-up questions.
- When the user asks about ICD-10 or ICD-10-GM codes (e.g. G43.0, E11, from German doctor's notes), use the ICD-10-GM reference below to explain which category the code belongs to and what it means in plain language.
- Keep replies concise (a few short paragraphs max).`

function getSystemPrompt(): string {
  try {
    return `${SYSTEM_PROMPT_BASE}\n\n---\n\n${getIcd10GmReference()}`
  } catch {
    return SYSTEM_PROMPT_BASE
  }
}

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
    const reportContext = body.reportContext && typeof body.reportContext === "object" ? (body.reportContext as ScanResultPayload) : undefined

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Chat is not configured. Add OPENAI_API_KEY to your .env.local file and restart the server. Get a key at https://platform.openai.com/api-keys",
        },
        { status: 503 }
      )
    }

    let contextBlock = ""
    // Prefer client-provided report context (works when server cache is empty, e.g. serverless)
    if (reportContext) {
      const formatted = formatScanContext(reportContext)
      if (formatted) {
        contextBlock = `\n\nUser's last scan (use this to answer; do not ask them to share details):\n${formatted}\n\nIf the user asks what the doctor said, what's in the note, or for a summary, answer directly from the scan above.`
      }
    } else if (executionId) {
      const scan =
        executionId.startsWith("wh-")
          ? getWebhookCachedResult(executionId)
          : await getScanResult(executionId)
      if (scan) {
        const formatted = formatScanContext(scan)
        if (formatted) {
          contextBlock = `\n\nUser's last scan (use this to answer; do not ask them to share details):\n${formatted}\n\nIf the user asks what the doctor said, what's in the note, or for a summary, answer directly from the scan above.`
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
          { role: "system", content: getSystemPrompt() },
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
