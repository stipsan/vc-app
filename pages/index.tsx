import { useMachine } from '@xstate/react'
import Head from 'next/head'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Celebrate from '../components/Celebrate'
import FetchVerifiableCredentials from '../components/FetchVerifiableCredentials'
import ParseVerifiableCredentials from '../components/ParseVerifiableCredentials'
import DemoVerifiableCredentials from '../components/DemoVerifiableCredentials'
import Header from '../components/Header'
import Strategy from '../components/Strategy'
import TamperingDetector from '../components/TamperingDetector'
import ValidateLinkedData from '../components/ValidateLinkedData'
import VerifyCredentials from '../components/VerifyCredentials'
import ScrollTo from '../components/ScrollTo'
import defaultMachine from '../lib/stateMachine'

export default function Index() {
  const [state, send, service] = useMachine(defaultMachine)

  useEffect(() => console.log('state changed', state), [state])
  useEffect(() => console.log('send changed', send), [send])
  useEffect(() => console.log('service changed', service), [service])

  return (
    <>
      <Head>
        <title>Verifiable Credentials Verifier</title>
      </Head>
      <form
        className="min-h-screen"
        onSubmit={(event) => {
          event.preventDefault()

          send({ type: 'EXEC', input: '' })
        }}
      >
        <Strategy state={state} send={send} />
        <Header state={state} send={send} />
        <FetchVerifiableCredentials state={state} send={send} />
        <ParseVerifiableCredentials state={state} send={send} />
        <DemoVerifiableCredentials state={state} send={send} />
        <ValidateLinkedData state={state} send={send} />
        <VerifyCredentials state={state} send={send} />
        <TamperingDetector state={state} send={send} />
        <ScrollTo state={state} />
      </form>
      <footer className="bg-gray-50 py-10 px-6 grid place-items-center">
        <a
          className="text-lg font-semibold"
          href="https://github.com/stipsan/vc-app"
        >
          GitHub
        </a>
      </footer>
      <Celebrate state={state} />
      <Toaster position="bottom-center" />
    </>
  )
}
