import { themes } from '@storybook/theming'
import { transparentize, darken } from 'polished'
import { enableMapSet } from 'immer'
import { Toaster } from 'react-hot-toast'
import { MachineProvider } from '../lib/contexts'
import 'tailwindcss/tailwind.css'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../tailwind.config.js'
import './style.css'
import { themeStore } from '../lib/utils'
import addons from '@storybook/addons'

enableMapSet()

// Simulate rehydrating state
const config = resolveConfig(tailwindConfig)
const { theme } = config
themeStore.setState({ theme })

// get channel to listen to event emitter
const channel = addons.getChannel()
channel.on('DARK_MODE', (dark) =>
  themeStore.setState({ scheme: dark ? 'dark' : 'light' })
)

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
  darkMode: {
    classTarget: 'html',
    darkClass: 'dark',
    lightClass: 'light',
    stylePreview: true,
    /*
    current: window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light',
      //*/
    dark: {
      ...themes.dark,
      appBg: darken(0.01, theme.colors.gray[900]),
      appContentBg: theme.colors.gray[900],
      barBg: darken(0.015, theme.colors.gray[900]),
      barSelectedColor: theme.colors.blue[600],
    },
    light: { ...themes.normal },
    /*
    // Override the default dark theme
    // Override the default light theme
    //*/
  },
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
        'App',
      ],
    },
  },
}

export const decorators = [
  (Story) => (
    <>
      <MachineProvider>
        <Story />
      </MachineProvider>
      <Toaster position="top-right" />
    </>
  ),
  ,
]
