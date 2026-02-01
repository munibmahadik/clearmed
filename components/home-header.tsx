"use client"

import { useSession } from "next-auth/react"

export function HomeHeader() {
  const { status } = useSession()
  if (status !== "authenticated") return null

  return (
    <header className="pt-14 pb-6 px-6">
      <div className="flex items-center justify-center gap-2">
        <svg
          className="w-9 h-9 text-primary"
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
        >
          <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
          <path d="M12 14h8M12 18h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24" cy="8" r="5" fill="currentColor" />
          <path d="M22 8h4M24 6v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="text-xl font-semibold text-foreground tracking-tight">ClearMED</span>
      </div>
    </header>
  )
}
