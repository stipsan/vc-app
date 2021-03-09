import { useMachine } from '@xstate/react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Header from '../components/Header'
import defaultMachine from '../lib/stateMachine'

const Strategy = dynamic(() => import('../components/Strategy'), {
  ssr: false,
  loading: () => (
    <>
      <div className="px-6 pt-8 flex flex-initial items-center">
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
const Celebrate = dynamic(() => import('../components/Celebrate'), {
  ssr: false,
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
        <Header state={state} />
        <FetchVerifiableCredentials state={state} send={send} />
        <ParseVerifiableCredentials state={state} send={send} />
        <DemoVerifiableCredentials state={state} send={send} />
        <ValidateLinkedData state={state} send={send} />
        <VerifyCredentials state={state} send={send} />
        <TamperingDetector state={state} send={send} />
        <ScrollTo state={state} />
      </form>
      <footer className="bg-gray-50 dark:bg-gray-800 dark:bg-opacity-50 py-10 px-6 grid place-items-center">
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
