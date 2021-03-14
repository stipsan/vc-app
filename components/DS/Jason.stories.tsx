import { ReactJason } from 'react-jason'
import { vscodeLight, vscodeDark } from 'react-jason/themes/index'

import json from '../../fixtures.json'

export const Dark = () => {
  const prefersDarkMode =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false // use light theme by default?

  const theme = prefersDarkMode ? vscodeDark : vscodeLight

  return <ReactJason value={json} theme={vscodeDark} />
}

export const Light = () => {
  const prefersDarkMode =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false // use light theme by default?

  const theme = prefersDarkMode ? vscodeDark : vscodeLight

  return <ReactJason value={json} theme={vscodeLight} sortKeys />
}

export default {
  title: 'Design System/Rich Formatting/Jason',
}
