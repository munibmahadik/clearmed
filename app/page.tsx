import { Navbar } from "@/components/navbar"
import { HomeContent } from "@/components/home-content"
import { HomeHeader } from "@/components/home-header"

export default function HomePage() {
  return (
    <main className="min-h-svh flex flex-col bg-background">
      <HomeHeader />
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-28">
        <HomeContent />
      </div>
      <Navbar />
    </main>
  )
}
