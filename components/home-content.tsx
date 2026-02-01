"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ScanButton } from "@/components/scan-button"
import { AuthGate } from "@/components/auth-gate"
import { ShieldCheck, Clock } from "lucide-react"

function AppLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M12 14h8M12 18h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="8" r="5" fill="currentColor" />
      <path d="M22 8h4M24 6v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function HomeContent() {
  const { status } = useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (pathname === "/" && searchParams.has("callbackUrl")) {
      router.replace("/", { scroll: false })
    }
  }, [pathname, searchParams, router])

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="w-full max-w-sm mx-auto flex flex-col items-center">
        {/* Single combined logo: icon left + ClearMed, a bit larger than header */}
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <AppLogo className="w-12 h-12 text-primary shrink-0" />
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            ClearMed
          </h1>
        </div>
        <p className="text-muted-foreground text-center text-sm mb-8 max-w-[260px]">
          Your doctor&apos;s notes, made clear — with a simple checklist and audio summary.
        </p>
        <AuthGate />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-center text-balance leading-tight mb-2">
        Your doctor&apos;s note, explained simply
      </h1>
      <p className="text-muted-foreground text-sm text-center mb-8 max-w-sm">
        Scan a note or upload a PDF. Get a friendly audio summary and a plain-language checklist.
      </p>
      <ScanButton />
      <footer className="mt-10 flex items-center justify-center gap-6 text-muted-foreground/80 text-xs">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-primary/70" strokeWidth={2} />
          Private & Secure
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-primary/70" strokeWidth={2} />
          Instant Results
        </span>
      </footer>
    </div>
  )
}
