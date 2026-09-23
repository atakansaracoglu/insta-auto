import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get("userId")
        if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 })

        const supabase = await getSupabaseServerClient()

        // 1. Total Automations
        const automationsQuery = supabase
            .from("automations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)

        // 2. Active Triggers
        const activeQuery = supabase
            .from("automations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("is_active", true)

        // 3. Audience Reached (Total Conversations)
        const audienceQuery = supabase
            .from("conversations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)

        // 4. Messages Sent (where is_from_instagram is false, implying bot/system sent it)
        const sentQuery = supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("is_from_instagram", false)

        // 5. Recent Activity (Last 5 messages sent by bot)
        const recentQuery = supabase
            .from("messages")
            .select("id, content, created_at, sender_username, conversation_id, recipient:conversations(recipient_username)")
            .eq("user_id", userId)
            .eq("is_from_instagram", false)
            .order("created_at", { ascending: false })
            .limit(5)

        // 6. Fetch Instagram profile stats
        const { data: user } = await supabase
            .from("users")
            .select("access_token")
            .eq("id", userId)
            .single()

        let igProfile: any = null
        let igInsights: any = null
        if (user?.access_token) {
            try {
                const igRes = await fetch(
                    `https://graph.instagram.com/v24.0/me?fields=username,followers_count,follows_count,media_count,profile_picture_url,biography,name&access_token=${user.access_token}`,
                    { cache: "no-store" }
                )
                if (igRes.ok) igProfile = await igRes.json()

                const since = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]
                const until = new Date().toISOString().split("T")[0]
                const insightsRes = await fetch(
                    `https://graph.instagram.com/v24.0/me/insights?metric=reach,views,profile_views,accounts_engaged,total_interactions,likes,comments,shares,saves,follows_and_unfollows&period=day&since=${since}&until=${until}&access_token=${user.access_token}`,
                    { cache: "no-store" }
                )
                if (insightsRes.ok) {
                    const insightsData = await insightsRes.json()
                    if (insightsData.data) {
                        igInsights = {} as Record<string, number>
                        for (const m of insightsData.data) {
                            igInsights[m.name] = (m.values ?? []).reduce((sum: number, v: any) => sum + (v.value ?? 0), 0)
                        }
                    }
                } else {
                    const errBody = await insightsRes.text()
                    console.error("[v0] Insights API error:", insightsRes.status, errBody)
                }
            } catch (e) {
                console.error("[v0] IG fetch error:", e)
            }
        }

        const results = await Promise.all([automationsQuery, activeQuery, audienceQuery, sentQuery, recentQuery])
        const failed = results.find(result => result.error)
        if (failed?.error) throw failed.error
        const [
            { count: automationsCount },
            { count: activeTriggersCount },
            { count: audienceCount },
            { count: messagesSentCount },
            { data: recentMessages },
        ] = results

        return NextResponse.json({
            metrics: {
                totalAutomations: automationsCount || 0,
                activeTriggers: activeTriggersCount || 0,
                audienceReached: audienceCount || 0,
                messagesSent: messagesSentCount || 0,
            },
            igProfile: igProfile ? {
                username: igProfile.username,
                name: igProfile.name,
                biography: igProfile.biography,
                followersCount: igProfile.followers_count,
                followsCount: igProfile.follows_count,
                mediaCount: igProfile.media_count,
                profilePicture: igProfile.profile_picture_url,
            } : null,
            igInsights: igInsights ?? null,
            recentActivity: recentMessages || []
        })
    } catch (error) {
        console.error("[v0] Dashboard Stats error:", error)
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
    }
}
