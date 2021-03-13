// This file should be imported dynamically using either `next/dynamic` or `React.lazy`
// As everything in here can load while the user is figuring out which strategy to use

import Celebrate from './Celebrate'
import DemoVerifiableCredentials from './DemoVerifiableCredentials'
import FetchVerifiableCredentials from './FetchVerifiableCredentials'
import ParseVerifiableCredentials from './ParseVerifiableCredentials'
import ScrollTo from './ScrollTo'
import CounterfeitCredentials from './CounterfeitCredentials'
import ValidateLinkedData from './ValidateLinkedData'
import VerifyCredentials from './VerifyCredentials'
import VerifyPresentation from './VerifyPresentation'
import { useMachineSelector } from '../lib/contexts'
import type { StateMachineState } from '../lib/types'
import { Suspense } from 'react'

const strategySelector = (state: StateMachineState) => state.context.strategy
function SelectStrategy() {
  const strategy = useMachineSelector(strategySelector)
  switch (strategy) {
    case 'demo':
      return <DemoVerifiableCredentials />

    default:
      throw new TypeError(`Unknown Strategy Type: ${strategy}`)
  }
}

export default function LazyBunch() {
  return (
    <>
      <Suspense fallback="TODO add fallback for SelectStrategy!">
        <SelectStrategy />
      </Suspense>
      <FetchVerifiableCredentials />
      <ParseVerifiableCredentials />

      <Suspense fallback="TODO add fallback for ValidateLinkedData!">
        <ValidateLinkedData />
      </Suspense>
      <Suspense fallback="TODO add fallback for VerifyCredentials!">
        <VerifyCredentials />
      </Suspense>
      <Suspense fallback="TODO add fallback for CounterfeitCredentials!">
        <CounterfeitCredentials />
      </Suspense>
      <Suspense fallback="TODO add fallback for VerifyPresentation!">
        <VerifyPresentation />
      </Suspense>
      <ScrollTo />
      <Suspense fallback="TODO add fallback for Celebrate!">
        <Celebrate />
      </Suspense>
    </>
  )
}
