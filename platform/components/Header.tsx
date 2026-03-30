'use client'

import { ClientSelector } from '@/components/ClientSelector'

export function Header() {
  return (
    <header className="h-12 border-b border-border/60 flex items-center justify-end px-5 gap-3 bg-card/50 backdrop-blur-sm shrink-0">
      <ClientSelector />
    </header>
  )
}
