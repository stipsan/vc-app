import { Suspense, useEffect } from 'react'
import toast from 'react-hot-toast'
import { createAsset } from 'use-asset'
import { useMachineSend, useMachineState } from '../lib/contexts'
import { useIdsList, useJsonMap } from '../lib/selectors'
import { ErrorMessage, Panel, ReadonlyTextarea } from './Formatted'
import ReportRow from './ReportRow'

const work = createAsset(async () => {
  try {
    const tooMuchData =
      process.env.NODE_ENV !== 'production' && false
        ? await import('../fixtures.json')
        : null
    const { default: faker } = await import('faker')
    const { Ed25519KeyPair } = await import('@transmute/did-key-ed25519')
    const { Ed25519Signature2018 } = await import(
      '@transmute/ed25519-signature-2018'
    )
    const { ld: vc } = await import('@transmute/vc.js')
    const didDoc = await import('../lib/did.json')
    const { default: documentLoader } = await import('../lib/documentLoader')

    const src = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1',
      ],
      id: 'http://example.gov/credentials/3732',
      type: ['VerifiableCredential', 'UniversityDegreeCredential'],
      issuer: { id: 'did:example:123' },
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: 'did:example:456',
        givenName: faker.name.firstName(),
        familyName: faker.name.lastName(),
        degree: {
          type: 'BachelorDegree',
          name: `Bachelor of ${faker.company
            .bsNoun()
            .replace(/(^\w{1})|(\s+\w{1})|(-\w{1})/g, (_) =>
              _.toUpperCase()
            )} and ${faker.company
            .bsNoun()
            .replace(/(^\w{1})|(\s+\w{1})|(-\w{1})/g, (_) => _.toUpperCase())}`,
        },
      },
    }

    const credential = {
      ...src,
      issuer: { id: didDoc.id },
      credentialSubject: {
        ...src.credentialSubject,
        id: didDoc.id,
      },
    }
    const key = await Ed25519KeyPair.from(didDoc.publicKey[0])
    key.id = key.controller + key.id
    const suite = new Ed25519Signature2018({ key })
    console.warn({ key, suite })
    const verifiableCredential = await vc.issue({
      credential,
      suite,
      documentLoader,
    })

    return {
      ok: true,
      data: [verifiableCredential].concat(tooMuchData).filter(Boolean),
    }
  } catch (error) {
    return { ok: false, error }
  }
})
export function DemoVerifiableCredentials() {
  const send = useMachineSend()
  const state = useMachineState()
  const ids = useIdsList()
  const json = useJsonMap()

  const result = state.value === 'demoing' ? work.read() : undefined

  useEffect(() => {
    if (result?.ok === true) {
      send({
        type: 'DEMO_SUCCESS',
        input: result.data,
      })
    }
    if (result?.ok === false) {
      send({ type: 'DEMO_FAILURE', input: result.error.message })
      toast.error(`Failed fetching Verifiable Credentials`)
    }
  }, [result, send])
  switch (true) {
    case result?.ok === false:
      return (
        <ReportRow readyState="error">
          <Panel variant="error">
            <ErrorMessage>{result.error}</ErrorMessage>
          </Panel>
        </ReportRow>
      )
    case ids.length > 1:
      return (
        <ReportRow readyState="success">
          <Panel variant="success">
            Created <span className="font-bold">{ids.length}</span>
            {ids.length === 1
              ? ' Verifiable Credential'
              : ' Verifiable Credentials'}
          </Panel>
          {ids.map((id) => (
            <ReadonlyTextarea key={id} value={JSON.stringify(json.get(id))} />
          ))}
        </ReportRow>
      )
    default:
      return null
  }
}
export default function DemoVerifiableCredentialsSuspender() {
  return (
    <Suspense
      fallback={
        <ReportRow readyState="loading">
          <Panel>Creating fake Verifiable Credentials...</Panel>
        </ReportRow>
      }
    >
      <DemoVerifiableCredentials />
    </Suspense>
  )
}
