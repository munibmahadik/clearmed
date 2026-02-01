"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Camera, FileText } from "lucide-react"

const WEBHOOK_RESULT_KEY = "webhook-result-"

export function ScanButton() {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const sendFile = async (file: File) => {
    if (isScanning) return
    const isImage = file.type.startsWith("image/")
    const isPdf = file.type === "application/pdf"
    if (!isImage && !isPdf) {
      setError("Please choose an image or PDF file.")
      return
    }
    setIsScanning(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("image", file)
      const res = await fetch("/api/scan", { method: "POST", body: formData, credentials: "include" })
      const text = await res.text()
      let json: { executionId?: string; error?: string; result?: unknown } = {}
      if (text.trim()) {
        try {
          json = JSON.parse(text) as { executionId?: string; error?: string; result?: unknown }
        } catch {
          throw new Error(res.ok ? "Invalid response from server" : `Scan failed (${res.status})`)
        }
      }
      if (!res.ok) throw new Error(json.error ?? "Scan failed")
      const executionId = json.executionId ?? "demo"
      if (executionId.startsWith("wh-") && json.result != null && typeof window !== "undefined") {
        try {
          sessionStorage.setItem(WEBHOOK_RESULT_KEY + executionId, JSON.stringify(json.result))
        } catch {
          // ignore
        }
      }
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ executionId }),
        credentials: "include",
      }).catch(() => {})
      router.push(`/results?executionId=${encodeURIComponent(executionId)}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Try again.")
      setIsScanning(false)
    }
  }

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) sendFile(file)
    e.target.value = ""
  }

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      sendFile(file)
    } else if (file) {
      setError("Please choose a PDF file.")
    }
    e.target.value = ""
  }

  return (
    <div className="w-full space-y-4">
      {error && (
        <p className="text-sm text-destructive text-center" role="alert">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Scan Photo – light green card, dark green icon */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraChange}
          className="hidden"
          aria-hidden
        />
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isScanning}
          className="flex flex-col items-center justify-center gap-3 py-7 px-4 rounded-2xl bg-primary/10 border border-primary/20 text-foreground hover:bg-primary/15 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none"
          aria-label="Scan photo – take a picture or choose from gallery"
        >
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shrink-0">
            <Camera className="w-7 h-7" strokeWidth={2} />
          </span>
          <span className="font-semibold text-foreground text-sm">Scan Photo</span>
          <span className="text-xs text-muted-foreground text-center leading-snug">
            Take a picture or choose from gallery.
          </span>
        </button>

        {/* Upload PDF – neutral card, gray icon */}
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          onChange={handlePdfChange}
          className="hidden"
          aria-hidden
        />
        <button
          type="button"
          onClick={() => pdfInputRef.current?.click()}
          disabled={isScanning}
          className="flex flex-col items-center justify-center gap-3 py-7 px-4 rounded-2xl bg-card border border-border text-foreground hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none"
          aria-label="Upload PDF – select a PDF from your device"
        >
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-muted-foreground/15 text-muted-foreground shrink-0">
            <FileText className="w-7 h-7" strokeWidth={2} />
          </span>
          <span className="font-semibold text-foreground text-sm">Upload PDF</span>
          <span className="text-xs text-muted-foreground text-center leading-snug">
            Select a PDF from your device.
          </span>
        </button>
      </div>

      {isScanning && (
        <p className="text-center text-sm text-muted-foreground">Processing…</p>
      )}
    </div>
  )
}
