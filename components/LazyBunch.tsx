// This file should be imported dynamically using either `next/dynamic` or `React.lazy`
// As everything in here can load while the user is figuring out which strategy to use

import type { Interpreter } from '../lib/stateMachine'
import Celebrate from './Celebrate'
import DemoVerifiableCredentials from './DemoVerifiableCredentials'
import FetchVerifiableCredentials from './FetchVerifiableCredentials'
import ParseVerifiableCredentials from './ParseVerifiableCredentials'
import ScrollTo from './ScrollTo'
import CounterfeitCredentials from './CounterfeitCredentials'
import ValidateLinkedData from './ValidateLinkedData'
import VerifyCredentials from './VerifyCredentials'
import VerifyPresentation from './VerifyPresentation'

export default function LazyBunch({
  state,
  send,
}: {
  state: Interpreter['state']
  send: Interpreter['send']
}) {
  return (
    <>
      <FetchVerifiableCredentials state={state} send={send} />
      <ParseVerifiableCredentials state={state} send={send} />
      <DemoVerifiableCredentials state={state} send={send} />
      <ValidateLinkedData state={state} send={send} />
      <VerifyCredentials state={state} send={send} />
      <CounterfeitCredentials state={state} send={send} />
      <VerifyPresentation state={state} send={send} />
      <ScrollTo state={state} />
      <Celebrate state={state} />
    </>
  )
}
