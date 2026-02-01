import { ScanActions } from "@/components/scan-actions"
import { Navbar } from "@/components/navbar"

export default function HomePage() {
  return (
    <main className="min-h-svh flex flex-col bg-background">
      {/* Header */}
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
          <span className="text-xl font-semibold text-foreground tracking-tight">ClearMed</span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-6 pb-28">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-center text-balance leading-tight mb-2">
          Your doctor&apos;s note, explained simply
        </h1>
        <p className="text-muted-foreground text-center text-base max-w-sm mb-10">
          Scan a note or upload a PDF. Get a friendly audio summary and a plain-language checklist.
        </p>

        <ScanActions />

        {/* Trust indicators */}
        <div className="mt-14 flex items-center gap-8 text-muted-foreground/80">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-medium">Private & Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-medium">Instant Results</span>
          </div>
        </div>
      </div>

      <Navbar />
    </main>
  )
}
