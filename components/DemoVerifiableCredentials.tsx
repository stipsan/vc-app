import { Suspense, useCallback, useEffect } from 'react'
import { createAsset } from 'use-asset'
import {
  useMachineSelector,
  useMachineSend,
  useOnMachineReset,
} from '../lib/contexts'
import { useIdsList, useJsonMap } from '../lib/selectors'
import ReactJason from './DS/react-jason'
import { ErrorMessage, Panel } from './Formatted'
import ReportRow from './ReportRow'

const work = createAsset(async () => {
  try {
    const [
      { default: faker },
      { Ed25519KeyPair },
      { Ed25519Signature2018 },
      { ld: vc },
      didDoc,
      { default: documentLoader },
    ] = await Promise.all([
      import(/* webpackChunkName: "faker" */ 'faker'),
      import(
        /* webpackChunkName: "did-key-ed25519" */ '@transmute/did-key-ed25519'
      ),
      import(
        /* webpackChunkName: "ed25519-signature-2018" */ '@transmute/ed25519-signature-2018'
      ),
      import(/* webpackChunkName: "vc-js" */ '@transmute/vc.js'),
      import(/* webpackChunkName: "did-json" */ '../lib/did.json'),
      import(/* webpackChunkName: "documentLoader" */ '../lib/documentLoader'),
    ])

    const date = process.env.STORYBOOK
      ? new Date('2019-12-11T03:50:55Z')
      : new Date()

    const create = (credentialSubject: any) => ({
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1',
      ],
      type: ['VerifiableCredential', 'UniversityDegreeCredential'],
      credentialSubject: {
        id: didDoc.id,
        ...credentialSubject,
      },
      id: 'http://example.gov/credentials/3732',
      issuer: didDoc.id,
      issuanceDate: date.toISOString(),
    })

    const key = await Ed25519KeyPair.from(didDoc.publicKey[0])
    key.id = key.controller + key.id
    const suite = new Ed25519Signature2018({ key, date })

    return {
      ok: true,
      data: [
        await vc.issue({
          credential: create({
            givenName: faker.name.firstName(),
            familyName: faker.name.lastName(),
          }),
          suite,
          documentLoader,
        }),
        await vc.issue({
          credential: create({
            degree: {
              type: 'BachelorDegree',
              name: `Bachelor of ${faker.company
                .bsNoun()
                .replace(/(^\w{1})|(\s+\w{1})|(-\w{1})/g, (_) =>
                  _.toUpperCase()
                )} and ${faker.company
                .bsNoun()
                .replace(/(^\w{1})|(\s+\w{1})|(-\w{1})/g, (_) =>
                  _.toUpperCase()
                )}`,
            },
          }),
          suite,
          documentLoader,
        }),
      ],
    }
  } catch (error) {
    return { ok: false, error }
  }
})
export function DemoVerifiableCredentials({
  defaultResult = undefined,
}: {
  defaultResult?: any
}) {
  useOnMachineReset(useCallback(() => work.clear(), []))
  const send = useMachineSend()
  const ids = useIdsList()
  const json = useJsonMap()
  const isCurrent = useMachineSelector(
    useCallback((state) => state.value === 'demoing', [])
  )

  const result = isCurrent ? work.read() : defaultResult

  useEffect(() => {
    if (result?.ok === true) {
      send({
        type: 'DEMO_SUCCESS',
        input: result.data,
      })
    }
    if (result?.ok === false) {
      console.error('DEMO_FAILURE', result.error)
      send({ type: 'DEMO_FAILURE', input: result.error.message })
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
    case ids.length > 0:
      return (
        <ReportRow readyState="success">
          <Panel>
            Created <span className="font-bold">{ids.length}</span>
            {ids.length === 1
              ? ' Verifiable Credential'
              : ' Verifiable Credentials'}
          </Panel>
          {ids.map((id) => (
            <Panel
              key={id}
              className="w-[calc(100vw-2rem)] md:w-[calc(100vw-3rem)]"
            >
              <ReactJason value={json.get(id)} />
            </Panel>
          ))}
        </ReportRow>
      )
    default:
      return null
  }
}
export default function DemoVerifiableCredentialsSuspender({
  defaultResult,
}: {
  defaultResult?: any
}) {
  return (
    <Suspense
      fallback={
        <ReportRow readyState="loading">
          <Panel>Creating fake Verifiable Credentials...</Panel>
        </ReportRow>
      }
    >
      <DemoVerifiableCredentials defaultResult={defaultResult} />
    </Suspense>
  )
}
