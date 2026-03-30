'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Zap,
  Image,
  CalendarDays,
  FileText,
  Palette,
  Anchor,
  Video,
  FolderOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clientes', icon: Users },
  { type: 'divider', label: 'Workspace' },
  { href: '/workspace/ads', label: 'Criativo de Ads', icon: Image },
  { href: '/workspace/social', label: 'Calendário Editorial', icon: CalendarDays },
  { href: '/workspace/copy', label: 'Copy de LP', icon: FileText },
  { href: '/workspace/brand', label: 'Brand System', icon: Palette },
  { href: '/workspace/hooks', label: 'Hook Engineer', icon: Anchor },
  { href: '/workspace/scripts', label: 'Script de Reels', icon: Video },
  { type: 'divider', label: 'Histórico' },
  { href: '/outputs', label: 'Entregáveis', icon: FolderOpen },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 border-r border-border/60 flex flex-col py-4 bg-card">
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm tracking-tight">V4 Skills</span>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-2 flex-1">
        {nav.map((item, i) => {
          if ('type' in item) {
            return (
              <p key={i} className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 pt-4 pb-1">
                {item.label}
              </p>
            )
          }
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors',
                active
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
