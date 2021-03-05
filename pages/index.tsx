import Head from 'next/head'
import FetchVerifiableCredentials from '../components/FetchVerifiableCredentials'
import Header from '../components/Header'
import { Toaster } from 'react-hot-toast'

export default function Index() {
  return (
    <>
      <Head>
        <title>Verifiable Credentials Verifier</title>
      </Head>
      <Header />
      <main className="pt-4" style={{ height: '200vh' }}>
        <FetchVerifiableCredentials />
      </main>
      <Toaster position="bottom-center" />
    </>
  )
}
