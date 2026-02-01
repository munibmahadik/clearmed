"use client"

import { useEffect, useState } from "react"
import { ResultsCard } from "@/components/results-card"
import type { ScanResultPayload } from "@/lib/n8n"

const WEBHOOK_RESULT_KEY = "webhook-result-"

type ApiResult = {
  executionId: string
  finished?: boolean
  status?: string
  result?: ScanResultPayload
  error?: string
}

interface ResultsViewProps {
  executionId: string
}

/**
 * Fetches /api/results?executionId=... (supports webhook wh-xxx and n8n execution IDs).
 * For webhook IDs on Vercel, falls back to sessionStorage when API returns 404 (no shared server cache).
 */
export function ResultsView({ executionId }: ResultsViewProps) {
  const [data, setData] = useState<ApiResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/results?executionId=${encodeURIComponent(executionId)}`)
      .then(async (res) => {
        if (cancelled) return
        if (res.status === 404 && executionId.startsWith("wh-") && typeof window !== "undefined") {
          const stored = sessionStorage.getItem(WEBHOOK_RESULT_KEY + executionId)
          if (stored) {
            try {
              const result = JSON.parse(stored) as ScanResultPayload
              // Keep in sessionStorage so chat page can use report context (Ask about this report)
              setData({ executionId, finished: true, status: "success", result })
              return
            } catch {
              // invalid stored data, fall through to use API error
            }
          }
        }
        const json = (await res.json()) as ApiResult
        if (cancelled) return
        if (json.error) setError(json.error)
        else setData(json)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load results")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [executionId])

  if (loading) {
    return (
      <div className="w-full max-w-md py-12 text-center text-muted-foreground">
        Loading your results…
      </div>
    )
  }

  if (error || !data?.result) {
    return (
      <div className="w-full max-w-md py-12 text-center">
        <p className="text-destructive">{error ?? "No results found."}</p>
      </div>
    )
  }

  const { result } = data
  // Always show "Verified Safe" for now; n8n can send verifiedSafe: false to show "Needs Review" when you enable it
  return (
    <ResultsCard
      checklist={result.checklist}
      audioSrc={result.audioUrl}
      audioBase64={result.audio_base64}
      verifiedSafe={true}
    />
  )
}
