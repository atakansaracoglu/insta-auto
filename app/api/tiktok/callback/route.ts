import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    const redirectUrl = new URL("/dashboard/settings", request.url)
    redirectUrl.searchParams.set("tiktok_error", error)
    return NextResponse.redirect(redirectUrl)
  }

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 })
  }

  try {
    const clientKey = process.env.TIKTOK_CLIENT_KEY
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET
    if (!clientKey || !clientSecret) {
      throw new Error("Missing TIKTOK_CLIENT_KEY or TIKTOK_CLIENT_SECRET")
    }

    const redirectUri = `${request.nextUrl.origin}/api/tiktok/callback`

    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }).toString(),
    })

    const tokenData = await tokenRes.json()
    if (tokenData.error || !tokenData.access_token) {
      console.error("[tiktok] Token error:", JSON.stringify(tokenData))
      const redirectUrl = new URL("/dashboard/settings", request.url)
      redirectUrl.searchParams.set("tiktok_error", tokenData.error_description || "Token exchange failed")
      return NextResponse.redirect(redirectUrl)
    }

    const accessToken = tokenData.access_token
    const refreshToken = tokenData.refresh_token
    const expiresIn = tokenData.expires_in || 86400
    const openId = tokenData.open_id

    let displayName = ""
    let avatarUrl = ""
    let followerCount = 0
    let followingCount = 0
    let videoCount = 0
    let likesCount = 0

    try {
      const userRes = await fetch(
        "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url,follower_count,following_count,video_count,likes_count",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      )
      const userData = await userRes.json()
      const user = userData.data?.user
      if (user) {
        displayName = user.display_name || ""
        avatarUrl = user.avatar_url || ""
        followerCount = user.follower_count || 0
        followingCount = user.following_count || 0
        videoCount = user.video_count || 0
        likesCount = user.likes_count || 0
      }
    } catch (e) {
      console.error("[tiktok] User info fetch error:", e)
    }

    const supabase = await getSupabaseServerClient()

    const userId = request.cookies.get("insta_session")?.value
    let parsedUserId: string | null = null
    if (userId) {
      try {
        parsedUserId = JSON.parse(userId).userId
      } catch {}
    }

    if (!parsedUserId) {
      const redirectUrl = new URL("/dashboard/settings", request.url)
      redirectUrl.searchParams.set("tiktok_error", "Instagram session not found. Please log in first.")
      return NextResponse.redirect(redirectUrl)
    }

    await supabase
      .from("users")
      .update({
        tiktok_open_id: openId,
        tiktok_access_token: accessToken,
        tiktok_refresh_token: refreshToken,
        tiktok_token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        tiktok_display_name: displayName,
        tiktok_avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsedUserId)

    const redirectUrl = new URL("/dashboard/settings", request.url)
    redirectUrl.searchParams.set("tiktok_connected", "true")
    return NextResponse.redirect(redirectUrl)
  } catch (error: any) {
    console.error("[tiktok] Callback error:", error)
    const redirectUrl = new URL("/dashboard/settings", request.url)
    redirectUrl.searchParams.set("tiktok_error", error.message)
    return NextResponse.redirect(redirectUrl)
  }
}
