import { NextResponse } from "next/server"
import { createUser } from "@/lib/auth-store"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body as { email?: string; password?: string; name?: string }
    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }
    const result = await createUser(email, password, name)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
