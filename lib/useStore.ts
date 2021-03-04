import create from 'zustand'
import { combine } from 'zustand/middleware'

export const useStore = create(
  combine(
    {
      url: '',
      auth: '',
      loading: false,
    },
    (set) => ({
      setUrl: (url: string) => set({ url }),
      setAuth: (auth: string) => set({ auth }),
      setLoading: (loading: boolean) => set({loading})
    })
  )
)
