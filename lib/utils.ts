import * as JSum from 'jsum'
import { useEffect } from 'react'
import type { TailwindConfig } from 'tailwindcss/tailwind-config'
import type { State } from 'zustand'
import create from 'zustand'

export function jsonChecksum(json: unknown): string {
  return JSum.digest(json, 'SHA256', 'hex')
}

//import { unstable_batchedUpdates } from 'react-dom'
// TODO
// pipe all batch calls through import { unstable_batchedUpdates } from 'react-dom'
// maybe in context? to check if it does anything

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

export const wait = (min, max = min) =>
  new Promise((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min)
  )

export interface LogsState extends State {
  urls: { [key: string]: 'loading' | Error | object }
  set: (url: string, entry: 'loading' | object | Error) => void
}

interface ThemeLoaderState extends State {
  scheme: 'light' | 'dark'
  setScheme: (next: 'light' | 'dark') => void
  theme: TailwindConfig['theme']
  set: (next: TailwindConfig['theme']) => void
}

export const themeStore = create<ThemeLoaderState>((set) => ({
  scheme:
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light',
  setScheme: (scheme: ThemeLoaderState['scheme']) => set({ scheme }),
  theme: undefined,
  set: (theme) => set({ theme }),
}))
const selectThemeVariables = (state: ThemeLoaderState) => state.theme
export const useThemeVariables = () => themeStore(selectThemeVariables)
const selectColorScheme = (state: ThemeLoaderState) => state.scheme
export const useColorScheme = () => themeStore(selectColorScheme)

const selectSetTheme = (state: ThemeLoaderState) => state.set
const selectSetScheme = (state: ThemeLoaderState) => state.setScheme
export function useTheme(theme: TailwindConfig['theme']) {
  // Handles theme rehydration from nextjs pages' getStaticProps callbacks
  const setTheme = themeStore(selectSetTheme)
  useEffect(() => {
    setTheme(theme)
  }, [setTheme, theme])

  // Observe dark mode media query
  const setScheme = themeStore(selectSetScheme)
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const listener = () => setScheme(media.matches ? 'dark' : 'light')
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [setScheme])
}

export interface LogsState extends State {
  urls: { [key: string]: 'loading' | Error | object }
  set: (url: string, entry: 'loading' | object | Error) => void
}
