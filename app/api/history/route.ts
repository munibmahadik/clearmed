import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { addScan, getScans } from "@/lib/history-store"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in to view history" }, { status: 401 })
  }
  const entries = getScans(session.user.email)
  return NextResponse.json({ scans: entries })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in to record scans" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const executionId = typeof body?.executionId === "string" ? body.executionId.trim() : ""
    if (!executionId) {
      return NextResponse.json({ error: "executionId required" }, { status: 400 })
    }
    addScan(session.user.email, executionId)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
