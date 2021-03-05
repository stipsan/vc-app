import Head from 'next/head'
import FetchVerifiableCredentials from '../components/FetchVerifiableCredentials'
import Header from '../components/Header'
import { Toaster } from 'react-hot-toast'
import ValidateLinkedData from '../components/ValidateLinkedData'

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
      </main>
      <Toaster position="bottom-center" />
    </>
  )
}
