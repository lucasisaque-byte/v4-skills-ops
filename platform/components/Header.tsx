'use client'

import { useState } from 'react'
import { Zap } from 'lucide-react'
import { useStore } from '@/lib/store'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/lib/api'

export function Header() {
  const model = useStore((s) => s.model)
  const setModel = useStore((s) => s.setModel)
  const [configError, setConfigError] = useState<string | null>(null)
  const [savingModel, setSavingModel] = useState(false)

  const handleModelChange = async (value: string) => {
    setConfigError(null)
    setSavingModel(true)
    try {
      await api.setConfig({ model: value })
      setModel(value)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Falha ao salvar o modelo no servidor'
      setConfigError(msg)
    } finally {
      setSavingModel(false)
    }
  }

  return (
    <header className="h-12 border-b border-border/60 flex items-center px-5 bg-card/50 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm tracking-tight">V4 Skills Platform</span>
      </div>
      <div className="ml-auto flex flex-col items-end gap-1">
        <Select value={model} onValueChange={handleModelChange} disabled={savingModel}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Modelo" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Anthropic</SelectLabel>
              <SelectItem value="claude-sonnet-4-6">Sonnet 4.6</SelectItem>
              <SelectItem value="claude-opus-4-6">Opus 4.6</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Google Gemini</SelectLabel>
              <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash ⚡ Mais rápido</SelectItem>
              <SelectItem value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite 💰 Mais barato</SelectItem>
              <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
              <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {configError && (
          <p className="text-[10px] text-red-400 max-w-[11rem] text-right leading-tight" role="alert">
            {configError}
          </p>
        )}
      </div>
    </header>
  )
}
