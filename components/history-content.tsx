"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { HistoryList } from "@/components/history-list"
import type { ScanEntry } from "@/lib/history-store"

export function HistoryContent() {
  const { status } = useSession()
  const router = useRouter()
  const [scans, setScans] = useState<ScanEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/")
      return
    }
    if (status !== "authenticated") return
    fetch("/api/history")
      .then((res) => (res.ok ? res.json() : { scans: [] }))
      .then((data: { scans?: ScanEntry[] }) => setScans(data.scans ?? []))
      .catch(() => setScans([]))
      .finally(() => setLoading(false))
  }, [status, router])

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm mt-4">Loading history…</p>
      </div>
    )
  }

  if (status === "unauthenticated") return null

  return <HistoryList scans={scans} />
}
