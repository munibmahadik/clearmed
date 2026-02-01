import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { triggerWorkflow, triggerViaWebhook } from "@/lib/n8n"

const DEMO_EXECUTION_ID = "demo"

// Allow longer run for n8n webhook (Vercel default is 10s; Pro can use 60)
export const maxDuration = 60

/**
 * POST /api/scan
 * Requires authentication. Triggers the n8n "process doctor's note" workflow.
 * Uses N8N_WEBHOOK_URL if set (works on free trial); otherwise uses workflow-run API (paid plan).
 * Body: multipart/form-data with image, or JSON with image/text.
 * Returns: { executionId } so the client can poll /api/results?executionId=...
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to scan" }, { status: 401 })
  }
  try {
    const contentType = request.headers.get("content-type") ?? ""

    // Webhook (Medical Agent Backend) - expects multipart with image, works on free trial
    // Return result in response so client can store it (Vercel serverless has no shared in-memory cache)
    if (process.env.N8N_WEBHOOK_URL) {
      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData()
        const { executionId, data: result } = await triggerViaWebhook(formData)
        return NextResponse.json({ executionId, result })
      }
      return NextResponse.json({ error: "Webhook expects multipart/form-data with image" }, { status: 400 })
    }

    // Workflow-run API (requires paid plan)
    let data: Record<string, unknown> = {}
    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}))
      data = typeof body === "object" && body !== null ? body : {}
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const image = formData.get("image")
      const text = formData.get("text")
      if (image && typeof image === "string") data.image = image
      if (text && typeof text === "string") data.text = text
      if (image instanceof Blob) data.image = await blobToBase64(image)
    }
    const baseUrl = process.env.N8N_BASE_URL
    const workflowId = process.env.N8N_WORKFLOW_ID_SCAN ?? process.env.N8N_WORKFLOW_ID

    if (!baseUrl || !workflowId || !process.env.N8N_API_KEY) {
      return NextResponse.json({ executionId: DEMO_EXECUTION_ID })
    }

    const { executionId } = await triggerWorkflow({ workflowId, data })
    return NextResponse.json({ executionId })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to trigger scan"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer()
  const base64 = Buffer.from(buf).toString("base64")
  return `data:${blob.type};base64,${base64}`
}
