"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ScanButton } from "@/components/scan-button"
import { AuthGate } from "@/components/auth-gate"

export function HomeContent() {
  const { status } = useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Prevent callbackUrl nesting: strip query when we're on the sign-in page
  useEffect(() => {
    if (pathname === "/" && searchParams.has("callbackUrl")) {
      router.replace("/", { scroll: false })
    }
  }, [pathname, searchParams, router])

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground text-center text-balance leading-tight mb-4">
          Scan Doctor&apos;s Note
        </h1>
        <p className="text-muted-foreground text-center text-base sm:text-lg max-w-xs mb-8">
          We&apos;ll explain it simply. Sign in or create an account to get started.
        </p>
        <AuthGate />
      </>
    )
  }

  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground text-center text-balance leading-tight mb-4">
        Scan Doctor&apos;s Note
      </h1>
      <div className="my-8">
        <ScanButton />
      </div>
      <p className="text-muted-foreground text-center text-base sm:text-lg max-w-xs">
        We&apos;ll explain it simply.
      </p>
      <div className="mt-12 flex items-center gap-6 text-muted-foreground/70">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs font-medium">Private & Secure</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-xs font-medium">Instant Results</span>
        </div>
      </div>
    </>
  )
}
