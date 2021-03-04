import create from 'zustand'
import { combine } from 'zustand/middleware'

export const useStore = create(
  combine({
    url: '',
    auth: '',
  },
  set => ({
  setUrl: (url: string) => set({url}),
  setAuth: (auth: string) => set({auth}),
})
  ))