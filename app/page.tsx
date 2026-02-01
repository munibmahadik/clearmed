import { Navbar } from "@/components/navbar"
import { HomeContent } from "@/components/home-content"

export default function HomePage() {
  return (
    <main className="min-h-svh flex flex-col bg-background">
      {/* Header */}
      <header className="pt-12 pb-4 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <svg
            className="w-8 h-8 text-primary"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
          >
            <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
            <path d="M12 14h8M12 18h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="24" cy="8" r="5" fill="currentColor" />
            <path d="M22 8h4M24 6v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-lg font-semibold text-foreground tracking-tight">ClearMed</span>
        </div>
      </header>

      {/* Main content: auth gate or scan (client component) */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <HomeContent />
      </div>

      {/* Bottom navbar */}
      <Navbar />
    </main>
  )
}
