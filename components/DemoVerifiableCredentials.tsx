import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useMachineSend, useMachineState } from '../lib/contexts'
import { ErrorMessage, Panel, ReadonlyTextarea } from './Formatted'
import ReportRow from './ReportRow'

export default function DemoVerifiableCredentials() {
  const send = useMachineSend()
  const state = useMachineState()
  const { ids, json } = state.context
  const demoing = state.matches('demoing')
  const [error, setError] = useState('')
  const [lastUsedStrategy, setLastUsedStrategy] = useState(false)

  useEffect(() => {
    if (state.value === 'parsing' || state.value === 'fetching') {
      setLastUsedStrategy(false)
    }
  }, [state.value])

  useEffect(() => {
    if (!demoing) {
      return
    }

    setLastUsedStrategy(true)
    setError('')

    let cancelled = false

    Promise.all([
      process.env.NODE_ENV !== 'production'
        ? import('../fixtures.json')
        : Promise.resolve({}),
      import('faker'),
      import('@transmute/did-key-ed25519'),
      import('@transmute/ed25519-signature-2018'),
      import('@transmute/vc.js'),
      import('../lib/did.json'),
      import('../lib/documentLoader'),
    ])
      .then(
        async ([
          tooMuchData,
          { default: faker },
          { Ed25519KeyPair },
          { Ed25519Signature2018 },
          { ld: vc },
          didDoc,
          { default: documentLoader },
        ]) => {
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
                name: `Bachelor of ${faker.company
                  .bsNoun()
                  .replace(/(^\w{1})|(\s+\w{1})|(\-\w{1})/g, (_) =>
                    _.toUpperCase()
                  )} and ${faker.company
                  .bsNoun()
                  .replace(/(^\w{1})|(\s+\w{1})|(\-\w{1})/g, (_) =>
                    _.toUpperCase()
                  )}`,
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

          if (cancelled) return
          send({
            type: 'DEMO_SUCCESS',
            input: [verifiableCredential].concat(tooMuchData),
          })
        }
      )
      .catch((reason) => {
        send({ type: 'DEMO_FAILURE', input: `${reason}` })
        toast.error(`Failed fetching Verifiable Credentials`)
        setError(reason)
      })

    return () => {
      cancelled = true
    }
  }, [demoing])

  switch (true) {
    case !lastUsedStrategy && !state.matches('demoing'):
      return null

    case !!error:
      return (
        <ReportRow readyState="error">
          <Panel variant="error">
            <ErrorMessage>{error}</ErrorMessage>
          </Panel>
        </ReportRow>
      )

    case ids.length > 0:
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

    case state.matches('demoing'):
      return (
        <ReportRow readyState="loading">
          <Panel>Creating fake Verifiable Credentials...</Panel>
        </ReportRow>
      )

    default:
      return null
  }
}
