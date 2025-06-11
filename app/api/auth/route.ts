import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createHash } from "crypto"
import { supabase } from "@/lib/supabase"

// This would be stored in environment variables in production
// For now, we'll hash it here for demonstration
const ADMIN_PASSWORD = "888888"
const ADMIN_PASSWORD_HASH = createHash("sha256").update(ADMIN_PASSWORD).digest("hex")

// Session duration (24 hours)
const SESSION_DURATION = 24 * 60 * 60 * 1000

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    // Hash the provided password for comparison
    const hashedPassword = createHash("sha256").update(password).digest("hex")

    if (hashedPassword !== ADMIN_PASSWORD_HASH) {
      return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 })
    }

    // Generate a secure session token
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + SESSION_DURATION)

    // Store the session in Supabase
    const { error } = await supabase.from("admin_sessions").insert({
      token: sessionToken,
      expires_at: expiresAt.toISOString(),
    })

    if (error) {
      console.error("Error storing session:", error)
      return NextResponse.json({ success: false, message: "Authentication error" }, { status: 500 })
    }

    // Set a secure HTTP-only cookie
    cookies().set({
      name: "admin_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: expiresAt,
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json({ success: false, message: "Authentication error" }, { status: 500 })
  }
}
