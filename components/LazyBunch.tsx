// This file should be imported dynamically using either `next/dynamic` or `React.lazy`
// As everything in here can load while the user is figuring out which strategy to use

import Celebrate from './Celebrate'
import DemoVerifiableCredentials from './DemoVerifiableCredentials'
import FetchVerifiableCredentials from './FetchVerifiableCredentials'
import ParseVerifiableCredentials from './ParseVerifiableCredentials'
import CounterfeitCredentials from './CounterfeitCredentials'
import ValidateLinkedData from './ValidateLinkedData'
import VerifyCredentials from './VerifyCredentials'
import VerifyPresentation from './VerifyPresentation'
import { useMachineSelector } from '../lib/contexts'
import type { StateMachineState } from '../lib/types'

const strategySelector = (state: StateMachineState) => state.context.strategy
function SelectStrategy() {
  const strategy = useMachineSelector(strategySelector)
  switch (strategy) {
    case 'demo':
      return <DemoVerifiableCredentials />
    case 'parse':
      return <ParseVerifiableCredentials />
    case 'fetch':
      return <FetchVerifiableCredentials />
    default:
      throw new TypeError(`Unknown Strategy Type: ${strategy}`)
  }
}

export default function LazyBunch() {
  return (
    <>
      <SelectStrategy />
      <ValidateLinkedData />
      <VerifyCredentials />
      <CounterfeitCredentials />
      <VerifyPresentation />
      <Celebrate />
    </>
  )
}
