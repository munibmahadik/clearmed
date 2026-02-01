import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getScans } from "@/lib/history-store"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { HistoryList } from "@/components/history-list"

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/")
  }
  const scans = getScans(session.user.email)

  return (
    <main className="min-h-svh flex flex-col bg-background">
      <header className="pt-8 pb-4 px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Go back"
          >
            <svg
              className="w-6 h-6 text-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-semibold text-foreground">Scan History</h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col px-6 pb-28">
        <HistoryList scans={scans} />
      </div>

      <Navbar />
    </main>
  )
}
