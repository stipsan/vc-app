import create from 'zustand'
import { combine } from 'zustand/middleware'

export const useStore = create(
  combine(
    {
      url: '',
      auth: '',
      editor: '',
    },
    (set) => ({
      setUrl: (url: string) => set({ url }),
      setAuth: (auth: string) => set({ auth }),
      setEditor: (editor: string) => set({ editor }),
    })
  )
)
