import create from 'zustand'
import { combine } from 'zustand/middleware'

export const useStore = create(
  combine(
    {
      url: '',
      auth: '',
      loading: false,
      items: [],
      jsonChecks: {},
      verifyChecks: {}
    },
    (set) => ({
      setUrl: (url: string) => set({ url }),
      setAuth: (auth: string) => set({ auth }),
      setLoading: (loading: boolean) => loading ? set({loading, items: [], jsonChecks: {}, verifyChecks: {}}) : set({loading}),
      setItems: (items: any[]) => set({items}),
      setJsonChecks: (jsonChecks) => set(state => ({jsonChecks: {...state.jsonChecks, ...jsonChecks}})),
      setVerifyChecks: (verifyChecks) => set(state => ({verifyChecks: {...state.verifyChecks, ...verifyChecks}})),
    })
  )
)
