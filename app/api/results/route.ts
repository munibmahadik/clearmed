import { NextResponse } from "next/server"
import { getExecution, parseScanResultFromExecution, getScanResult, getWebhookCachedResult, WEBHOOK_EXECUTION_PREFIX } from "@/lib/n8n"

const DEMO_EXECUTION_ID = "demo"

/**
 * GET /api/results?executionId=...
 * Fetches result for the results page.
 * Handles: demo, webhook (wh-xxx), n8n execution.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const executionId = searchParams.get("executionId")
  if (!executionId) {
    return NextResponse.json(
      { error: "Missing executionId" },
      { status: 400 }
    )
  }

  if (executionId === DEMO_EXECUTION_ID) {
    const result = await getScanResult(DEMO_EXECUTION_ID)
    return NextResponse.json({
      executionId: DEMO_EXECUTION_ID,
      finished: true,
      status: "success",
      result,
    })
  }

  if (executionId.startsWith(WEBHOOK_EXECUTION_PREFIX)) {
    const result = getWebhookCachedResult(executionId)
    if (result) {
      return NextResponse.json({
        executionId,
        finished: true,
        status: "success",
        result,
      })
    }
    return NextResponse.json({ error: "Webhook result expired or not found" }, { status: 404 })
  }

  try {
    const exec = await getExecution(executionId, { includeData: true })
    const payload = parseScanResultFromExecution(exec)
    return NextResponse.json({
      executionId: exec.id,
      finished: exec.finished,
      status: exec.status,
      result: payload,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch results"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
