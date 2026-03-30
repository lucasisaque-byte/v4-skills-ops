import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Client {
  id: string
  name: string
  segment: string
  has_dcc: boolean
  has_ucm: boolean
  has_brand_system: boolean
  primary_color?: string
}

interface AppStore {
  activeClient: Client | null
  setActiveClient: (client: Client | null) => void
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      activeClient: null,
      setActiveClient: (client) => set({ activeClient: client }),
    }),
    { name: 'v4-platform-store' }
  )
)
