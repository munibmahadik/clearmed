import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    apple: Boolean(process.env.APPLE_ID && process.env.APPLE_SECRET),
  })
}
