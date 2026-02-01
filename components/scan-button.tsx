"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Camera } from "lucide-react"

const WEBHOOK_RESULT_KEY = "webhook-result-"

export function ScanButton() {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sendImage = async (file: File) => {
    if (isScanning) return
    setIsScanning(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("image", file)
      const res = await fetch("/api/scan", { method: "POST", body: formData })
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
      // Store webhook result client-side so results page works on Vercel (no shared server cache)
      if (executionId.startsWith("wh-") && json.result != null && typeof window !== "undefined") {
        try {
          sessionStorage.setItem(WEBHOOK_RESULT_KEY + executionId, JSON.stringify(json.result))
        } catch {
          // sessionStorage full or unavailable
        }
      }
      router.push(`/results?executionId=${encodeURIComponent(executionId)}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Try again.")
      setIsScanning(false)
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      sendImage(file)
    } else if (file) {
      setError("Please choose an image file (e.g. JPEG or PNG).")
    }
    e.target.value = ""
  }

  return (
    <>
      {error && (
        <p className="mb-3 text-sm text-destructive text-center max-w-xs" role="alert">
          {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden
      />
      <button
        onClick={handleClick}
        disabled={isScanning}
        className="relative flex items-center justify-center w-44 h-44 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:opacity-70 disabled:pointer-events-none"
        aria-label="Scan doctor's note - upload image"
      >
        {/* Pulse animation ring */}
        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse" />
        
        {/* Inner button content */}
        <span className="relative z-10 flex items-center justify-center w-40 h-40 rounded-full bg-primary">
          <Camera className="w-16 h-16" strokeWidth={1.5} />
        </span>
      </button>
    </>
  )
}
