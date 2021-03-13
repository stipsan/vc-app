import { enableMapSet } from 'immer'
import { Toaster } from 'react-hot-toast'

import 'tailwindcss/tailwind.css'
import '../style.css'

enableMapSet()

/*
const theme = require('tailwindcss/resolveConfig')(
  require('../tailwind.config')
)
console.log(theme.theme.screens)

import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport'

const viewports = Object.keys(theme.theme.screens).reduce((viewport, name) => {
  const widthInt = parseInt(theme.theme.screens[name])
  const type =
    widthInt < 768 ? 'mobile' : widthInt < 1280 ? 'tablet' : 'desktop'
  return {
    ...viewport,
    [name]: {
      name,
      styles: { height: '100vh', width: theme.theme.screens[name] },
      type,
    },
  }
}, {})

console.log({ viewports, MINIMAL_VIEWPORTS })
//*/

export const parameters = {
  layout: 'centered',
  //viewport: { viewports },
  options: {
    storySort: {
      method: 'alphabetical',
      order: [
        'Design System',
        'State Machine',
        [
          'Strategy',
          'Header',
          'LazyBunch',
          'FetchVerifiableCredentials',
          'ParseVerifiableCredentials',
          'DemoVerifiableCredentials',
          'ValidateLinkedData',
          'VerifyCredentials',
          'CounterfeitCredentials',
          'VerifyPresentation',
          'Celebrate',
        ],
      ],
    },
  },
}

export const decorators = [
  (Story) => (
    <>
      <Story />
      <Toaster position="top-right" />
    </>
  ),
]
