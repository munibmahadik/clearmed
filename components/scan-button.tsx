"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Camera } from "lucide-react"

export function ScanButton() {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const sendImage = async (file: File) => {
    if (isScanning) return
    setIsScanning(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      const res = await fetch("/api/scan", { method: "POST", body: formData })
      const text = await res.text()
      let json: { executionId?: string; error?: string } = {}
      if (text.trim()) {
        try {
          json = JSON.parse(text) as { executionId?: string; error?: string }
        } catch {
          throw new Error(res.ok ? "Invalid response from server" : `Scan failed (${res.status})`)
        }
      }
      if (!res.ok) throw new Error(json.error ?? "Scan failed")
      const executionId = json.executionId ?? "demo"
      router.push(`/results?executionId=${encodeURIComponent(executionId)}`)
    } catch {
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
    }
    e.target.value = ""
  }

  return (
    <>
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
