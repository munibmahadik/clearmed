import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { HomeContent } from "@/components/home-content"
import { HomeHeader } from "@/components/home-header"

function HomeContentFallback() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="min-h-svh flex flex-col bg-background">
      <HomeHeader />
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-28">
        <Suspense fallback={<HomeContentFallback />}>
          <HomeContent />
        </Suspense>
      </div>
      <Navbar />
    </main>
  )
}
