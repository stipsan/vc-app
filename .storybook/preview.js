import { enableMapSet } from 'immer'
import { Toaster } from 'react-hot-toast'

import 'tailwindcss/tailwind.css'
import '../style.css'

enableMapSet()

export const decorators = [
  (Story) => (
    <>
      <Story />
      <Toaster position="top-right" />
    </>
  ),
]
