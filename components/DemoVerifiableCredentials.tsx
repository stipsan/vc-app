import { Ed25519KeyPair } from '@transmute/did-key-ed25519'
import { Ed25519Signature2018 } from '@transmute/ed25519-signature-2018'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import type { Interpreter } from '../lib/stateMachine'
import { ErrorMessage, Panel, ReadonlyTextarea } from './Formatted'
import ReportRow from './ReportRow'
import didDoc from '../lib/did.json'
import { ld as vc } from '@transmute/vc.js'
import documentLoader from '../lib/documentLoader'

export default function DemoVerifiableCredentials(props: {
  state: Interpreter['state']
  send: Interpreter['send']
}) {
  const { send, state } = props
  const { ids, json } = state.context
  const demoing = state.matches('demoing')
  const [error, setError] = useState('')
  const [lastUsedStrategy, setLastUsedStrategy] = useState(false)

  useEffect(() => {
    if (state.matches('parsing') || state.matches('fetching')) {
      setLastUsedStrategy(false)
    }
  }, [state])

  useEffect(() => {
    if (!demoing) {
      return
    }

    setLastUsedStrategy(true)
    setError('')

    let cancelled = false

    import('faker')
      .then(async ({ default: faker }) => {
        console.log(faker)
        if (cancelled) return
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
              name: 'Bachelor of Science and Arts',
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
        const suite = new Ed25519Signature2018({
          key,
        })
        const verifiableCredential = await vc.issue({
          credential,
          suite,
          documentLoader,
        })

        if (cancelled) return
        send({ type: 'DEMO_SUCCESS', input: [verifiableCredential] })
      })
      .catch((reason) => {
        send({ type: 'DEMO_FAILURE', input: `${reason}` })
        toast.error(`Failed fetching Verifiable Credentials`)
        setError(reason)
      })

    return () => {
      cancelled = true
    }
  }, [demoing])

  if (!lastUsedStrategy && !state.matches('demoing')) {
    return null
  }

  if (error) {
    return (
      <ReportRow readyState="error">
        <Panel className="text-red-900 bg-red-50">
          <ErrorMessage>{error}</ErrorMessage>
        </Panel>
      </ReportRow>
    )
  }

  if (ids.length) {
    return (
      <ReportRow readyState="success">
        <Panel className="text-green-900 bg-green-50">
          Created <strong className="font-bold">{ids.length}</strong>
          {ids.length === 1
            ? ' Verifiable Credential'
            : ' Verifiable Credentials'}
        </Panel>
        {ids.map((id) => (
          <ReadonlyTextarea key={id} value={JSON.stringify(json.get(id))} />
        ))}
      </ReportRow>
    )
  }

  if (state.matches('demoing')) {
    return (
      <ReportRow readyState="loading">
        <Panel>Creating fake Verifiable Credentials...</Panel>
      </ReportRow>
    )
  }

  return null
}