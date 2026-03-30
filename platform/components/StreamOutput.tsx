'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface StreamOutputProps {
  content: string
  isStreaming: boolean
  className?: string
  placeholder?: string
}

export function StreamOutput({ content, isStreaming, className, placeholder }: StreamOutputProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && isStreaming) {
      ref.current.scrollTop = ref.current.scrollHeight
    }
  }, [content, isStreaming])

  return (
    <div
      ref={ref}
      className={cn(
        'font-mono text-sm leading-relaxed overflow-y-auto rounded-lg border border-border/60 bg-background p-4 whitespace-pre-wrap',
        isStreaming && 'border-blue-500/40',
        className
      )}
    >
      {content || (
        <span className="text-muted-foreground/50">{placeholder || 'O resultado aparecerá aqui...'}</span>
      )}
      {isStreaming && <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-0.5 align-middle" />}
    </div>
  )
}
