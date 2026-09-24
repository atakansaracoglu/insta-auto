import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 })

  const supabase = await getSupabaseServerClient()
  const { data: user } = await supabase
    .from("users")
    .select("access_token, instagram_id, username")
    .eq("id", userId)
    .single()

  if (!user?.access_token) {
    return NextResponse.json({ error: "No access token found" }, { status: 404 })
  }

  const token = user.access_token

  const results: Record<string, any> = { instagram_id: user.instagram_id, username: user.username }

  // 1. Debug token — shows granted scopes
  try {
    const debugRes = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(token)}`,
      { cache: "no-store" },
    )
    const debugData = await debugRes.json()
    results.debug_token = {
      scopes: debugData.data?.scopes,
      granular_scopes: debugData.data?.granular_scopes,
      is_valid: debugData.data?.is_valid,
      expires_at: debugData.data?.expires_at
        ? new Date(debugData.data.expires_at * 1000).toISOString()
        : "never",
      app_id: debugData.data?.app_id,
      type: debugData.data?.type,
      error: debugData.data?.error,
    }
  } catch (e: any) {
    results.debug_token = { error: e.message }
  }

  // 2. Test me endpoint — basic profile fetch
  try {
    const meRes = await fetch(
      `https://graph.instagram.com/v24.0/me?fields=id,username&access_token=${encodeURIComponent(token)}`,
      { cache: "no-store" },
    )
    const meData = await meRes.json()
    results.me_check = meRes.ok ? { id: meData.id, username: meData.username } : { error: meData.error }
  } catch (e: any) {
    results.me_check = { error: e.message }
  }

  // 3. Check messaging permission by calling me/conversations
  try {
    const convRes = await fetch(
      `https://graph.instagram.com/v24.0/me/conversations?platform=instagram&access_token=${encodeURIComponent(token)}`,
      { cache: "no-store" },
    )
    const convData = await convRes.json()
    results.messaging_check = convRes.ok
      ? { status: "ok", conversation_count: convData.data?.length ?? 0 }
      : { status: "failed", error: convData.error }
  } catch (e: any) {
    results.messaging_check = { error: e.message }
  }

  return NextResponse.json(results)
}
