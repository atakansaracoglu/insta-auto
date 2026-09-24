import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY
  if (!clientKey) {
    return NextResponse.json({ error: "TikTok not configured" }, { status: 500 })
  }

  const redirectUri = `${request.nextUrl.origin}/api/tiktok/callback`
  const csrfState = Math.random().toString(36).substring(2)
  const scope = "user.info.stats,user.info.profile"

  const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/")
  authUrl.searchParams.set("client_key", clientKey)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("scope", scope)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("state", csrfState)

  return NextResponse.redirect(authUrl.toString())
}
