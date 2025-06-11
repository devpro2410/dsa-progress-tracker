import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"

export async function POST() {
  try {
    const sessionToken = cookies().get("admin_session")?.value

    if (sessionToken) {
      // Delete the session from the database
      await supabase.from("admin_sessions").delete().eq("token", sessionToken)

      // Clear the cookie
      cookies().delete("admin_session")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
