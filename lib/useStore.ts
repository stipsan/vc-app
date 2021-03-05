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
      verifyChecks: {},
      tamperings: {},
      success: false,
    },
    (set) => ({
      setUrl: (url: string) => set({ url }),
      setAuth: (auth: string) => set({ auth }),
      setLoading: (loading: boolean) => loading ? set({loading, success: false, items: [], jsonChecks: {}, verifyChecks: {}, tamperings: {}}) : set({loading}),
      setItems: (items: any[]) => set({items}),
      setJsonChecks: (jsonChecks) => set(state => ({jsonChecks: {...state.jsonChecks, ...jsonChecks}})),
      setVerifyChecks: (verifyChecks) => set(state => ({verifyChecks: {...state.verifyChecks, ...verifyChecks}})),
      setTamperings: (tamperings) => set(state => ({tamperings: {...state.tamperings, ...tamperings}})),
      setSuccess: (success: boolean) => set( {success}),
    })
  )
)
