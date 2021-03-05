import create from 'zustand'
import { combine } from 'zustand/middleware'

export const useStore = create(
  combine(
    {
      url: '',
      auth: '',
      loading: false,
      items: [],
      jsonLDs: []
    },
    (set) => ({
      setUrl: (url: string) => set({ url }),
      setAuth: (auth: string) => set({ auth }),
      setLoading: (loading: boolean) => set({loading}),
      setItems: (items: any[]) => set({items}),
      setJsonLDS: (jsonLDs: any[]) => set({jsonLDs})
    })
  )
)
