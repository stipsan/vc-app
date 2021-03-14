import { ReactJason } from 'react-jason'
import { vscodeLight, vscodeDark } from 'react-jason/themes/index'

import json from '../../fixtures.json'

export const Dark = () => {
  return <ReactJason value={json} theme={vscodeDark} />
}

export const Light = () => {
  return <ReactJason value={json} theme={vscodeLight} sortKeys />
}

export default {
  title: 'Design System/Rich Formatting/Jason',
}
