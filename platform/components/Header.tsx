'use client'

import { Zap } from 'lucide-react'

export function Header() {
  return (
    <header className="h-12 border-b border-border/60 flex items-center px-5 bg-card/50 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm tracking-tight">V4 Skills Platform</span>
      </div>
    </header>
  )
}
