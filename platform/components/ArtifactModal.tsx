'use client'

import { useEffect } from 'react'
import { X, FileText } from 'lucide-react'
import { StreamOutput } from '@/components/StreamOutput'

interface Props {
  artifact: { name: string; content: string } | null
  onClose: () => void
}

export function ArtifactModal({ artifact, onClose }: Props) {
  useEffect(() => {
    if (!artifact) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [artifact, onClose])

  if (!artifact) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-2xl mx-4 rounded-xl border border-border/60 bg-card shadow-2xl flex flex-col"
        style={{ maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/40 shrink-0">
          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium flex-1">{artifact.name}</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <StreamOutput
            content={artifact.content}
            isStreaming={false}
            className="min-h-[200px] max-h-none border-0 bg-transparent p-0"
          />
        </div>
      </div>
    </div>
  )
}
