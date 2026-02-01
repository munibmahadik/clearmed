"use client"

import { History, Home, LogOut } from "lucide-react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"

export function Navbar() {
  const { status } = useSession()
  const isSignedIn = status === "authenticated"

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
        {isSignedIn && (
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-6 h-6" strokeWidth={1.5} />
            <span className="text-xs font-medium">Sign out</span>
          </button>
        )}
      </div>
    </nav>
  )
}
