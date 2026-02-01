"use client"

import { useRef } from "react"
import { Camera } from "lucide-react"
import { useMedicalScan } from "@/hooks/useMedicalScan"

export function ScanButton() {
  const { scan, isScanning, error, clearError } = useMedicalScan()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    clearError()
    inputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void scan(file)
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
      {error && (
        <p className="mb-2 text-sm text-destructive text-center" role="alert">
          {error}
        </p>
      )}
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
