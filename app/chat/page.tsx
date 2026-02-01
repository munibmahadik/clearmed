import { ChatView } from "@/components/chat-view"
import { Navbar } from "@/components/navbar"
import Link from "next/link"

type PageProps = { searchParams: Promise<{ executionId?: string }> }

export default async function ChatPage({ searchParams }: PageProps) {
  const params = await searchParams
  const executionId = params.executionId ?? null

  return (
    <main className="min-h-svh flex flex-col bg-background">
      {/* Header */}
      <header className="pt-8 pb-4 px-6 shrink-0">
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
          <h1 className="text-xl font-semibold text-foreground">Chat</h1>
        </div>
      </header>

      {/* Chat UI */}
      <div className="flex-1 flex flex-col min-h-0 pb-24">
        <ChatView executionId={executionId} />
      </div>

      <Navbar />
    </main>
  )
}
