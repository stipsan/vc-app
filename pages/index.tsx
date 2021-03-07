import { useMachine } from '@xstate/react'
import Head from 'next/head'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Celebrate from '../components/Celebrate'
import FetchVerifiableCredentials from '../components/FetchVerifiableCredentials'
import Header from '../components/Header'
import TamperingDetector from '../components/TamperingDetector'
import ValidateLinkedData from '../components/ValidateLinkedData'
import VerifyCredentials from '../components/VerifyCredentials'
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
        className="pb-20"
        onSubmit={(event) => {
          event.preventDefault()

          send({ type: 'FETCH', input: '' })
        }}
      >
        <Header state={state} send={send} />
        <FetchVerifiableCredentials state={state} send={send} />
        <ValidateLinkedData state={state} send={send} />
        <VerifyCredentials state={state} send={send} />
        <TamperingDetector state={state} send={send} />
      </form>
      <Celebrate />
      <Toaster position="bottom-center" />
    </>
  )
}
