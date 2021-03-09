import { useMachine } from '@xstate/react'
import Head from 'next/head'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Celebrate from '../components/Celebrate'
import FetchVerifiableCredentials from '../components/FetchVerifiableCredentials'
import ParseVerifiableCredentials from '../components/ParseVerifiableCredentials'
import DemoVerifiableCredentials from '../components/DemoVerifiableCredentials'
import Header from '../components/Header'

import TamperingDetector from '../components/TamperingDetector'
import ValidateLinkedData from '../components/ValidateLinkedData'
import VerifyCredentials from '../components/VerifyCredentials'
import ScrollTo from '../components/ScrollTo'
import defaultMachine from '../lib/stateMachine'
import dynamic from 'next/dynamic'

const Strategy = dynamic(() => import('../components/Strategy'), {
  ssr: false,
  loading: () => (
    <>
      <div className="mx-6 mt-8 flex flex-initial items-center">
        <div className="animate-pulse bg-gray-100 py-1 rounded-full w-16">
          &nbsp;
        </div>
        <div
          className="animate-pulse bg-gray-50 mx-3 my-1 rounded text-gray-900 w-10"
          style={{ animationDelay: '250ms' }}
        >
          &nbsp;
        </div>
        <div
          className="animate-pulse bg-gray-50 mx-3 my-1 rounded text-gray-900 w-10"
          style={{ animationDelay: '500ms' }}
        >
          &nbsp;
        </div>
      </div>
      <div
        className="mx-6 mt-4 bg-gray-50 text-black text-opacity-80 animate-pulse rounded-lg py-2 px-3"
        style={{ animationDelay: '250ms' }}
      >
        Loading...
      </div>
    </>
  ),
})

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
