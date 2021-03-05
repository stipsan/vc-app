import Head from 'next/head'
import FetchVerifiableCredentials from '../components/FetchVerifiableCredentials'
import Header from '../components/Header'
import { Toaster } from 'react-hot-toast'
import ValidateLinkedData from '../components/ValidateLinkedData'
import VerifyCredentials from '../components/VerifyCredentials'
import TamperingDetector from '../components/TamperingDetector'
import Celebrate from '../components/Celebrate'

export default function Index() {
  return (
    <>
      <Head>
        <title>Verifiable Credentials Verifier</title>
      </Head>
      <Header />
      <main className="pb-20">
        <FetchVerifiableCredentials />
        <ValidateLinkedData />
        <VerifyCredentials />
        <TamperingDetector />
      </main>
      <Celebrate />
      <Toaster position="bottom-center" />
    </>
  )
}
