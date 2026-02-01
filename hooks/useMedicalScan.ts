"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"

export type UseMedicalScanResult = {
  /** Submit an image file; on success redirects to /results?executionId=... */
  scan: (file: File) => Promise<string | null>
  isScanning: boolean
  error: string | null
  clearError: () => void
}

/**
 * Hook to run the medical scan flow: POST image to /api/scan, then redirect to results.
 * Backend returns { executionId }; results page fetches /api/results?executionId=... for text + audio.
 */
export function useMedicalScan(): UseMedicalScanResult {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scan = useCallback(
    async (file: File): Promise<string | null> => {
      const isImage = file.type.startsWith("image/")
      const isPdf = file.type === "application/pdf"
      if (!isImage && !isPdf) {
        setError("Please choose an image or PDF file.")
        return null
      }
      setIsScanning(true)
      setError(null)
      try {
        const formData = new FormData()
        formData.append("image", file)
        const res = await fetch("/api/scan", { method: "POST", body: formData })
        const json = (await res.json()) as { executionId?: string; error?: string }
        if (!res.ok) throw new Error(json.error ?? "Scan failed")
        const executionId = json.executionId ?? "demo"
        router.push(`/results?executionId=${encodeURIComponent(executionId)}`)
        return executionId
      } catch (e) {
        const message = e instanceof Error ? e.message : "Scan failed"
        setError(message)
        return null
      } finally {
        setIsScanning(false)
      }
    },
    [router]
  )

  const clearError = useCallback(() => setError(null), [])

  return { scan, isScanning, error, clearError }
}
