"use client"

import Link from "next/link"
import type { ScanEntry } from "@/lib/history-store"
import { FileText } from "lucide-react"

interface HistoryListProps {
  scans: ScanEntry[]
}

export function HistoryList({ scans }: HistoryListProps) {
  if (scans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" strokeWidth={1.5} />
        <p className="text-muted-foreground font-medium">No scans yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Scan a doctor&apos;s note from Home to see it here.
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {scans.map((scan, index) => (
        <li key={`${scan.executionId}-${scan.createdAt}`}>
          <Link
            href={`/results?executionId=${encodeURIComponent(scan.executionId)}`}
            className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card text-foreground hover:bg-muted/50 transition-colors"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
              <FileText className="w-5 h-5" strokeWidth={1.5} />
            </span>
            <span className="font-medium">Medical Report {index + 1}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
