// This file should be imported dynamically using either `next/dynamic` or `React.lazy`
// As everything in here can load while the user is figuring out which strategy to use

import DemoVerifiableCredentials from '../components/DemoVerifiableCredentials'
import FetchVerifiableCredentials from '../components/FetchVerifiableCredentials'
import ParseVerifiableCredentials from '../components/ParseVerifiableCredentials'
import ScrollTo from '../components/ScrollTo'
import TamperingDetector from '../components/TamperingDetector'
import ValidateLinkedData from '../components/ValidateLinkedData'
import VerifyCredentials from '../components/VerifyCredentials'
import type { Interpreter } from '../lib/stateMachine'
import Celebrate from './Celebrate'

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
      <TamperingDetector state={state} send={send} />
      <ScrollTo state={state} />
      <Celebrate state={state} />
    </>
  )
}
