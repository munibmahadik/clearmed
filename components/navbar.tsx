"use client"

import { History, Home } from "lucide-react"
import Link from "next/link"

export function Navbar() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-6">
        <Link
          href="/"
          className="flex flex-col items-center gap-1 text-primary transition-colors"
          aria-label="Home"
        >
          <Home className="w-6 h-6" strokeWidth={1.5} />
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link
          href="/history"
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="History"
        >
          <History className="w-6 h-6" strokeWidth={1.5} />
          <span className="text-xs font-medium">History</span>
        </Link>
      </div>
    </nav>
  )
}
