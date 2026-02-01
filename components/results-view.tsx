"use client"

import { useEffect, useState } from "react"
import { ResultsCard } from "@/components/results-card"
import type { ScanResultPayload } from "@/lib/n8n"

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
 * Fetches /api/results?executionId=... (supports webhook wh-xxx and n8n execution IDs)
 * and renders ResultsCard with text + audio_base64 for playback.
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
      .then((res) => res.json())
      .then((json: ApiResult) => {
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
  return (
    <ResultsCard
      checklist={result.checklist}
      audioSrc={result.audioUrl}
      audioBase64={result.audio_base64}
      verifiedSafe={result.verifiedSafe}
    />
  )
}
