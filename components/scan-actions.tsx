"use client"

import { useRef } from "react"
import { Camera, FileText } from "lucide-react"
import { useMedicalScan } from "@/hooks/useMedicalScan"

export function ScanActions() {
  const { scan, isScanning, error, clearError } = useMedicalScan()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const handleImageClick = () => {
    clearError()
    imageInputRef.current?.click()
  }

  const handlePdfClick = () => {
    clearError()
    pdfInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void scan(file)
    e.target.value = ""
  }

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void scan(file)
    e.target.value = ""
  }

  return (
    <>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        aria-hidden
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handlePdfChange}
        className="hidden"
        aria-hidden
      />
      {error && (
        <p className="mb-4 text-sm text-destructive text-center" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        {/* Scan photo - camera or gallery */}
        <button
          onClick={handleImageClick}
          disabled={isScanning}
          className="flex-1 flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none"
        >
          <span className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground">
            <Camera className="w-8 h-8" strokeWidth={1.5} />
          </span>
          <span className="font-semibold text-foreground">Scan Photo</span>
          <span className="text-sm text-muted-foreground text-center">
            Take a picture or choose from gallery
          </span>
        </button>
        {/* Upload PDF */}
        <button
          onClick={handlePdfClick}
          disabled={isScanning}
          className="flex-1 flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-secondary bg-secondary/30 hover:bg-secondary/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none"
        >
          <span className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary text-secondary-foreground">
            <FileText className="w-8 h-8" strokeWidth={1.5} />
          </span>
          <span className="font-semibold text-foreground">Upload PDF</span>
          <span className="text-sm text-muted-foreground text-center">
            Select a PDF from your device
          </span>
        </button>
      </div>
      {isScanning && (
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">
          Processing…
        </p>
      )}
    </>
  )
}
