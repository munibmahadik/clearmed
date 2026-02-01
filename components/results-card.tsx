"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { base64ToBlobUrl } from "@/lib/utils"

interface ChecklistItem {
  text: string
  checked: boolean
}

interface ResultsCardProps {
  checklist?: ChecklistItem[]
  /** URL for audio (e.g. static file or blob URL) */
  audioSrc?: string
  /** Base64-encoded MP3 from backend; converted to blob URL for playback */
  audioBase64?: string
  /** Guardian check passed; if false, show "Needs Review" instead of "Verified Safe" */
  verifiedSafe?: boolean
}

const defaultChecklist: ChecklistItem[] = [
  { text: "Take medication with food", checked: true },
  { text: "Drink plenty of water daily", checked: true },
  { text: "Schedule follow-up in 2 weeks", checked: false },
  { text: "Rest and avoid heavy lifting", checked: true },
]

export function ResultsCard({ 
  checklist = defaultChecklist,
  audioSrc,
  audioBase64,
  verifiedSafe = true,
}: ResultsCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Convert base64 to playable blob URL (iOS/mobile-friendly)
  useEffect(() => {
    if (!audioBase64) {
      setBlobUrl(null)
      return
    }
    const url = base64ToBlobUrl(audioBase64, "audio/mpeg")
    setBlobUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [audioBase64])

  const effectiveAudioSrc = blobUrl ?? audioSrc ?? undefined

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(() => {
          // Handle autoplay restrictions
        })
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = x / rect.width
      audioRef.current.currentTime = percentage * duration
    }
  }

  const formatTime = (time: number) => {
    if (!time || !isFinite(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <Card className="w-full max-w-md bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
      <CardContent className="p-6 sm:p-7 space-y-5">
        {/* Status */}
        <div className="flex flex-col items-center py-4">
          <div className="mb-3">
            <svg 
              className={`w-14 h-14 ${verifiedSafe ? "text-primary" : "text-amber-500"}`}
              viewBox="0 0 80 80" 
              fill="none"
              aria-hidden="true"
            >
              <path 
                d="M40 8L12 20v20c0 18.5 12.8 35.8 28 40 15.2-4.2 28-21.5 28-40V20L40 8z" 
                fill="currentColor"
                fillOpacity="0.1"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              {verifiedSafe ? (
                <path 
                  d="M28 40l8 8 16-16" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              ) : (
                <path 
                  d="M40 32v14M40 50h.01" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>
          <h2 className={`text-lg font-semibold tracking-tight ${verifiedSafe ? "text-primary" : "text-amber-600"}`}>
            {verifiedSafe ? "Verified Safe" : "Needs Review"}
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {verifiedSafe ? "No concerning findings detected" : "A medical professional has been alerted to review."}
          </p>
        </div>

        <hr className="border-0 border-t border-border" />

        {/* Audio */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-card-foreground uppercase tracking-wide text-muted-foreground">
            Listen to summary
          </h3>
          <div className="bg-muted/50 rounded-xl p-4">
            {effectiveAudioSrc ? (
              <>
                <audio
                  ref={audioRef}
                  src={effectiveAudioSrc}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                  preload="metadata"
                  playsInline
                  className="sr-only"
                />
                <div className="flex items-center gap-4">
              {/* Large Play Button */}
              <button
                onClick={togglePlay}
                className="flex-shrink-0 w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label={isPlaying ? "Pause audio" : "Play audio"}
              >
                {isPlaying ? (
                  <svg className="w-7 h-7 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z" />
                  </svg>
                )}
              </button>

              {/* Progress Section */}
              <div className="flex-1 space-y-2">
                {/* Progress Bar */}
                <div 
                  className="h-2 bg-muted rounded-full cursor-pointer overflow-hidden"
                  onClick={handleSeek}
                  role="slider"
                  aria-label="Audio progress"
                  aria-valuemin={0}
                  aria-valuemax={duration || 100}
                  aria-valuenow={progress}
                  tabIndex={0}
                >
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
                  />
                </div>
                
                {/* Time Display */}
                <div className="flex justify-between text-sm text-muted-foreground font-medium">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-3">
                Audio summary will appear here once generated.
              </p>
            )}
          </div>
        </div>

        <hr className="border-0 border-t border-border" />

        {/* From your note – findings and recommendations (not necessarily to-dos) */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-card-foreground uppercase tracking-wide text-muted-foreground">
            From your note
          </h3>
          <p className="text-xs text-muted-foreground">
            Findings and recommendations from your doctor&apos;s note.
          </p>
          <ul className="space-y-2" role="list">
            {checklist.map((item, index) => (
              <li 
                key={index}
                className="flex items-start gap-3 py-2.5 px-3 rounded-lg bg-muted/30 border border-transparent"
              >
                <span 
                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                    item.checked 
                      ? "bg-primary/15 text-primary" 
                      : "bg-amber-500/15 text-amber-600"
                  }`}
                  aria-hidden="true"
                >
                  {item.checked ? (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <circle cx="12" cy="12" r="1" fill="currentColor" />
                    </svg>
                  )}
                </span>
                <span className="text-[15px] text-card-foreground leading-snug">
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
