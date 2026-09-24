"use client"

import { Activity, ArrowUpRight, BarChart3, MessageSquare, Users } from "lucide-react"

export default function AnalyticsPage() {
  return <div className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10">
    <header className="border-b border-border pb-7"><p className="text-sm text-muted-foreground">Performans</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">İstatistikler</h1><p className="mt-2 text-sm text-muted-foreground">Otomatik konuşmalarınızla insanların nasıl etkileşime girdiğini görün.</p></header>
    <div className="grid border-b border-border sm:grid-cols-3"><Metric label="Konuşmalar" icon={MessageSquare} /><Metric label="Ulaşılan kişi" icon={Users} /><Metric label="Yanıt oranı" icon={Activity} /></div>
    <section className="mt-7 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4"><div><h2 className="text-sm font-semibold">Zaman içinde performans</h2><p className="mt-1 text-xs text-muted-foreground">Veri toplandıkça konuşma aktivitesi burada görünecek.</p></div><span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">Son 30 gün</span></div>
      <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center"><span className="flex size-11 items-center justify-center rounded-xl bg-secondary"><BarChart3 className="size-5 text-muted-foreground" /></span><h3 className="mt-4 text-sm font-medium">İstatistikler hazırlanıyor</h3><p className="mt-1.5 max-w-sm text-xs leading-5 text-muted-foreground">Otomasyonlarınız mesaj göndermeye başladığında performans ve kitle trendleri burada görünecek.</p><a href="/dashboard/automations" className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold">Otomasyonları incele<ArrowUpRight className="size-3.5" /></a></div>
    </section>
  </div>
}

function Metric({ label, icon: Icon }: { label: string; icon: React.ComponentType<{ className?: string }> }) {
  return <div className="border-border py-6 sm:border-r sm:px-6 first:pl-0 last:border-r-0"><div className="flex items-center justify-between"><p className="text-xs font-medium text-muted-foreground">{label}</p><Icon className="size-4 text-muted-foreground" /></div><p className="mt-3 text-3xl font-semibold">—</p></div>
}
