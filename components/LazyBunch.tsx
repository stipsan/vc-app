// This file should be imported dynamically using either `next/dynamic` or `React.lazy`
// As everything in here can load while the user is figuring out which strategy to use

import Celebrate from './Celebrate'
import dynamic from 'next/dynamic'
import type { Interpreter } from '../lib/stateMachine'

const FetchVerifiableCredentials = dynamic(
  () => import('../components/FetchVerifiableCredentials'),
  { ssr: false }
)
const ParseVerifiableCredentials = dynamic(
  () => import('../components/ParseVerifiableCredentials'),
  { ssr: false }
)
const DemoVerifiableCredentials = dynamic(
  () => import('../components/DemoVerifiableCredentials'),
  { ssr: false }
)
const ValidateLinkedData = dynamic(
  () => import('../components/ValidateLinkedData'),
  { ssr: false }
)
const VerifyCredentials = dynamic(
  () => import('../components/VerifyCredentials'),
  { ssr: false }
)
const TamperingDetector = dynamic(
  () => import('../components/TamperingDetector'),
  { ssr: false }
)
const ScrollTo = dynamic(() => import('../components/ScrollTo'), { ssr: false })

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
