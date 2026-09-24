"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"
import { ArrowRight, Bot, CheckCircle2, Eye, Heart, Loader2, MessageCircle, MessageSquare, Play, Plus, Share2, Bookmark, UserCheck, Users, Video, Workflow } from "lucide-react"
import { useInstagramSession } from "@/hooks/use-instagram-session"

interface IgProfile {
  username: string
  name: string
  biography: string
  followersCount: number
  followsCount: number
  mediaCount: number
  profilePicture: string | null
}

interface IgInsights {
  reach: number
  views: number
  content_views: number
  profile_views: number
  accounts_engaged: number
  total_interactions: number
  likes: number
  comments: number
  shares: number
  saves: number
  follows_and_unfollows: number
}

interface YtStats {
  title: string
  thumbnail: string | null
  subscriberCount: number
  viewCount: number
  videoCount: number
}

interface TikTokStats {
  displayName: string
  avatarUrl: string
  followerCount: number
  followingCount: number
  videoCount: number
  likesCount: number
}

interface DashboardStats {
  metrics: { totalAutomations: number; activeTriggers: number; audienceReached: number; messagesSent: number }
  igProfile: IgProfile | null
  igInsights: IgInsights | null
  ytStats: YtStats | null
  tiktokStats: TikTokStats | null
  recentActivity: Array<{ id: string; content: string; created_at: string; recipient?: { recipient_username: string } }>
}

const POLL_INTERVAL = 10_000

export default function DashboardPage() {
  const { username, userId, isLoading: sessionLoading } = useInstagramSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(() => {
    if (!userId) return
    fetch(`/api/dashboard/stats?userId=${userId}`)
      .then(r => r.json())
      .then(data => { if (data && !data.error) setStats(data) })
      .catch(e => console.error("Failed to load dashboard stats", e))
      .finally(() => setLoading(false))
  }, [userId])

  useEffect(() => {
    fetchStats()
    const id = setInterval(fetchStats, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [fetchStats])

  if (sessionLoading || loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>

  const metrics = stats?.metrics
  const ig = stats?.igProfile
  const insights = stats?.igInsights
  const yt = stats?.ytStats
  const tt = stats?.tiktokStats
  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10">
      {/* Header with profile picture */}
      <header className="flex flex-col justify-between gap-5 pb-7 sm:flex-row sm:items-end">
        <div className="flex items-center gap-4">
          {ig?.profilePicture && (
            <img src={ig.profilePicture} alt={ig.username} className="size-14 rounded-full border-2 border-border object-cover" />
          )}
          <div>
            <p className="text-sm text-muted-foreground">Hoş geldin, {ig?.name || username || "creator"}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">{ig ? `@${ig.username}` : "Your workspace"}</h1>
          </div>
        </div>
        <Link href="/dashboard/automations" className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Plus className="size-4" />Otomasyon oluştur</Link>
      </header>

      {/* Platform Stats — 3 columns side by side */}
      <section className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Instagram */}
        {ig && (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]"><svg className="size-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></span>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Instagram</h2>
            </div>
            <div className="space-y-3">
              <AnimatedMetric label="Takipçi" value={ig.followersCount} icon={Users} />
              <AnimatedMetric label="Görüntülenme" value={insights ? (insights.views ?? 0) + (insights.reach ?? 0) : 0} icon={Eye} />
              <AnimatedMetric label="Etkileşim" value={insights ? (insights.likes ?? 0) + (insights.comments ?? 0) + (insights.shares ?? 0) + (insights.saves ?? 0) + (insights.profile_views ?? 0) + (insights.accounts_engaged ?? 0) : 0} icon={Heart} />
            </div>
          </div>
        )}

        {/* YouTube */}
        {yt && (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded bg-[#FF0000]"><svg className="size-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></span>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">YouTube</h2>
            </div>
            <div className="space-y-3">
              <AnimatedMetric label="Abone" value={yt.subscriberCount} icon={Users} />
              <AnimatedMetric label="Görüntülenme" value={yt.viewCount} icon={Eye} />
              <AnimatedMetric label="Video" value={yt.videoCount} icon={Video} />
            </div>
          </div>
        )}

        {/* TikTok */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded bg-black dark:bg-white"><svg className="size-3 text-white dark:text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.98a8.18 8.18 0 004.76 1.52V7.05a4.84 4.84 0 01-1-.36z"/></svg></span>
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">TikTok</h2>
          </div>
          {tt ? (
            <div className="space-y-3">
              <AnimatedMetric label="Takipçi" value={tt.followerCount} icon={Users} />
              <AnimatedMetric label="Beğeni" value={tt.likesCount} icon={Heart} />
              <AnimatedMetric label="Video" value={tt.videoCount} icon={Video} />
            </div>
          ) : (
            <div className="flex min-h-[140px] flex-col items-center justify-center gap-3">
              <p className="text-xs text-muted-foreground">TikTok hesabını bağla</p>
              <a href="/api/tiktok/connect" className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-secondary px-3 text-xs font-medium hover:bg-secondary/80">Bağla</a>
            </div>
          )}
        </div>
      </section>

      {/* Automation Metrics Card */}
      <section className="mb-6 rounded-xl border border-border bg-card p-6" aria-label="Otomasyon özeti">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Otomasyon</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric label="Otomasyonlar" value={metrics?.totalAutomations ?? 0} icon={Workflow} />
          <Metric label="Aktif tetikleyiciler" value={metrics?.activeTriggers ?? 0} icon={CheckCircle2} />
          <Metric label="Gönderilen mesaj" value={metrics?.messagesSent ?? 0} icon={MessageSquare} />
          <Metric label="Ulaşılan kişi" value={metrics?.audienceReached ?? 0} icon={Users} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4"><div><h2 className="text-sm font-semibold">Son konuşmalar</h2><p className="mt-1 text-xs text-muted-foreground">Otomasyonların gönderdiği son yanıtlar</p></div><Link href="/dashboard/inbox" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">Tümünü gör<ArrowRight className="size-3.5" /></Link></div>
          <div className="divide-y divide-border">
            {stats?.recentActivity?.length ? stats.recentActivity.slice(0, 6).map(message => <div key={message.id} className="flex items-center gap-3 px-5 py-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary"><MessageSquare className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">@{message.recipient?.recipient_username || "instagram_user"}</p><p className="mt-1 truncate text-xs text-muted-foreground">{message.content}</p></div><time className="text-xs text-muted-foreground">{new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></div>) : <EmptyState icon={MessageSquare} title="Henüz konuşma yok" description="Yeni otomatik yanıtlar burada görünecek." />}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-secondary"><Bot className="size-4" /></span><div><h2 className="text-sm font-semibold">Otomasyon durumu</h2><p className="mt-0.5 text-xs text-muted-foreground">Hesabınız bağlı</p></div></div><dl className="mt-5 space-y-3 border-t border-border pt-4 text-sm"><div className="flex justify-between"><dt className="text-muted-foreground">Instagram</dt><dd className="flex items-center gap-1.5 font-medium"><span className="size-1.5 rounded-full bg-foreground" />Bağlı</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Aktif otomasyonlar</dt><dd className="font-medium">{metrics?.activeTriggers ?? 0}</dd></div></dl></section>
          <section className="rounded-xl bg-primary p-5 text-primary-foreground"><h2 className="text-sm font-semibold">Yeni otomasyon oluştur</h2><p className="mt-2 text-xs leading-5 text-primary-foreground/75">Yorum, DM veya hikaye yanıtlarını otomatik cevaba dönüştür.</p><Link href="/dashboard/automations" className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold">Otomasyon oluştur<ArrowRight className="size-3.5" /></Link></section>
        </aside>
      </div>
    </div>
  )
}

function AnimatedMetric({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)
  const [arrow, setArrow] = useState<"up" | "down" | null>(null)

  useEffect(() => {
    const from = prev.current
    prev.current = value
    if (from === value) { setDisplay(value); return }
    const diff = value - from
    setArrow(diff > 0 ? "up" : "down")
    const hideTimer = setTimeout(() => setArrow(null), 2000)
    const steps = Math.min(Math.abs(diff), 30)
    const stepTime = 600 / steps
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplay(Math.round(from + (diff * i) / steps))
      if (i >= steps) clearInterval(id)
    }, stepTime)
    return () => { clearInterval(id); clearTimeout(hideTimer) }
  }, [value])

  return (
    <div className="rounded-lg bg-secondary/50 px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <p className="text-2xl font-semibold tracking-tight tabular-nums">{display.toLocaleString()}</p>
        {arrow && (
          <span className={`inline-flex animate-fade-out text-sm font-bold ${arrow === "up" ? "text-emerald-500" : "text-red-500"}`}>
            {arrow === "up" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </div>
  )
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-lg bg-secondary/50 px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value.toLocaleString()}</p>
    </div>
  )
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center"><span className="flex size-10 items-center justify-center rounded-lg bg-secondary"><Icon className="size-4 text-muted-foreground" /></span><h3 className="mt-4 text-sm font-medium">{title}</h3><p className="mt-1.5 text-xs text-muted-foreground">{description}</p></div>
}
