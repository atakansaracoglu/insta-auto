"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const NAV = [
  { href: "/dashboard", label: "Home", icon: "/icons/home.svg" },
  { href: "/dashboard/automations", label: "Auto replies", icon: "/icons/journal.svg" },
  { href: "/dashboard/inbox", label: "Conversations", icon: "/icons/chat.svg" },
  { href: "/dashboard/ice-breakers", label: "Conversation starters", icon: "/icons/squads.svg" },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  username?: string
  profilePic?: string | null
  onLogout?: () => void
  onNavigate?: () => void
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ className, username = "creator", profilePic, onLogout, onNavigate, collapsed = false, onToggle, ...props }: SidebarProps) {
  const pathname = usePathname()

  const itemClass = (active: boolean) => cn(
    "relative flex h-10 items-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
    collapsed ? "justify-center px-0" : "gap-3 px-3",
    active ? "bg-sidebar-accent text-sidebar-foreground" : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
  )

  return (
    <aside className={cn("flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground", className)} {...props}>
      <div className={cn("flex h-16 items-center border-b border-sidebar-border", collapsed ? "justify-center" : "px-3")}>
        <Link href="/dashboard" onClick={onNavigate} aria-label="insta-p8 home" className={cn("flex items-center gap-2.5 rounded-lg", !collapsed && "px-2")}>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><svg className="size-4" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg></span>
          {!collapsed && <span className="text-sm font-semibold tracking-tight">appleius</span>}
        </Link>
        {!collapsed && onToggle && <button onClick={onToggle} aria-label="Collapse sidebar" title="Collapse sidebar" className="ml-auto flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"><ChevronLeft className="size-4" /></button>}
      </div>

      {collapsed && onToggle && <div className="px-3 pt-3"><button onClick={onToggle} aria-label="Expand sidebar" title="Expand sidebar" className="flex size-10 w-full items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"><ChevronRight className="size-4" /></button></div>}

      <nav className="flex-1 space-y-1 px-3 py-3" aria-label="Dashboard navigation">
        {NAV.map(item => {
          const active = pathname === item.href
          return <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} aria-label={collapsed ? item.label : undefined} title={collapsed ? item.label : undefined} className={itemClass(active)}>
            <img src={item.icon} alt="" className={cn("size-4 shrink-0 dark:invert", active && item.href === "/dashboard" && "dark:invert-0")} />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        })}

      </nav>

      <div className="border-t border-sidebar-border p-3">
        {!collapsed && <div className="mb-3 flex items-center justify-between px-1"><span className="text-xs text-muted-foreground">Appearance</span><ThemeToggle className="h-7 w-14" /></div>}
        <div className={cn("flex items-center rounded-lg bg-sidebar-accent p-2", collapsed ? "justify-center" : "gap-2.5")}>
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
            {profilePic ? <img src={profilePic} alt={username} className="size-full object-cover" /> : username.charAt(0).toUpperCase()}
          </div>
          {!collapsed && <><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">@{username}</p><p className="mt-0.5 text-[11px] text-muted-foreground">Instagram connected</p></div><button onClick={onLogout} aria-label="Log out" title="Log out" className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar hover:text-destructive"><LogOut className="size-4" /></button></>}
        </div>
      </div>
    </aside>
  )
}
