import * as JSum from 'jsum'
import documentLoader from './documentLoader'

export function jsonChecksum(json: unknown): string {
  return JSum.digest(json, 'SHA256', 'hex')
}

/*

useStore, semi local semi shared
useEffect(() => {

  if(transitioning to completed state, keep the logs and reports visible) {
    return () => {we are either being unmounted, or starting annother batch}
  }

}, [['ready', 'success', 'failure'].includes(state.value)])

*/

// move out of context, into zustand instead, so much simpler. first, make the Sequencer and use-asset
// Instead of fchecking results of previous runs, simply fire FAILURE events for future stepps in the ladder.

export const wait = delay => new Promise(resolve => setTimeout(resolve, delay))



import { unstable_batchedUpdates } from 'react-dom'
// TODO
// pipe all batch calls through import { unstable_batchedUpdates } from 'react-dom'
// maybe in context? to check if it does anything

import create from 'zustand'
import type { State } from 'zustand';
import type { TailwindConfig } from 'tailwindcss/tailwind-config'
interface DocumentLoaderState extends State {
  documentLoader: typeof documentLoader,
  set: (next: typeof documentLoader) => void
}

export const documentLoaderStore = create<DocumentLoaderState>(set => ({
  documentLoader,
  set: documentLoader => set({documentLoader})
}))
export type DocumentLoader = typeof documentLoader

export interface LogsState extends State {
  urls: { [key: string]: 'loading' | Error | object }
  set: (url: string, entry: 'loading' | object | Error) => void
}


interface ThemeLoaderState extends State {
  theme:TailwindConfig,
  set: (next: TailwindConfig) => void
}

export const useTheme = create<ThemeLoaderState>(set => ({
  theme: undefined,
  set: theme =>  set({theme,})
}))


export interface LogsState extends State {
  urls: { [key: string]: 'loading' | Error | object }
  set: (url: string, entry: 'loading' | object | Error) => void
}