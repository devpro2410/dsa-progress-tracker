import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const sessionToken = cookies().get("admin_session")?.value

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Check if the session exists and is valid
    const { data, error } = await supabase
      .from("admin_sessions")
      .select("*")
      .eq("token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error || !data) {
      // Clear invalid cookie
      cookies().delete("admin_session")
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({ authenticated: true })
  } catch (error) {
    console.error("Session verification error:", error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
