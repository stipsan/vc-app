import { jsonChecksum } from '../lib/utils'
import { MachineProvider } from '../lib/storybook'
import CounterfeitCredentials from './CounterfeitCredentials'

import verifiableCredentials from '../fixtures.json'
import Header from './Header'

function Example({ batch }: { batch: any[] }) {
  return (
    <div className="w-screen min-h-screen pt-20">
      <MachineProvider batch={batch}>
        <Header />
        <CounterfeitCredentials />
      </MachineProvider>
    </div>
  )
}

export const Failure = () => {
  const skippedJson = verifiableCredentials[0]
  const failedJson = verifiableCredentials[1]
  const counterfeitJson = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential'],
    credentialSubject: {
      id: 'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
    },
    id: 'ba491968-a0d3-4be1-9f8f-99bc1262a3e0',
    issuer: 'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
    issuanceDate: '2021-03-16T14:44:05.391Z',
    proof: {
      type: 'Ed25519Signature2018',
      created: '2021-03-16T14:44:05.436Z',
      jws:
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..C5mTHZtMu-NDrMyeHUtJOuh4h1S5gg1UNPzp5Pt8Ars5jOx9GWf978OlRmY5B6oq7GFnpz0KrQ2WACa8PRAFBA',
      proofPurpose: 'assertionMethod',
      verificationMethod:
        'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ#z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
    },
  }

  const skippedJsonId = jsonChecksum(skippedJson)
  const failedJsonId = jsonChecksum(failedJson)
  const counterfeitJsonId = jsonChecksum(counterfeitJson)
  return (
    <Example
      batch={[
        { type: 'DEMO' },
        { type: 'EXEC' },
        {
          type: 'DEMO_SUCCESS',
          input: [skippedJson, failedJson, counterfeitJson],
        },
        { type: 'LINKING_DATA_FAILURE', input: skippedJsonId },
        { type: 'LINKING_DATA_SUCCESS', input: failedJsonId },
        { type: 'LINKING_DATA_SUCCESS', input: counterfeitJsonId },
        { type: 'LINKING_DATA_COMPLETE', input: '' },
        { type: 'VERIFIED_CREDENTIAL_FAILURE', input: skippedJsonId },
        { type: 'VERIFIED_CREDENTIAL_FAILURE', input: failedJsonId },
        { type: 'VERIFIED_CREDENTIAL_SUCCESS', input: counterfeitJsonId },
        { type: 'VERIFIED_CREDENTIAL_COMPLETE', input: '' },
      ]}
    />
  )
}

export const Success = () => {
  const json = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential'],
    credentialSubject: {
      id: 'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
    },
    id: 'http://example.gov/credentials/3732',
    issuer: 'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
    issuanceDate: '2021-03-16T15:17:10.998Z',
    expirationDate: '2022-03-16T15:16:52.695Z',
    proof: {
      type: 'Ed25519Signature2018',
      created: '2021-03-16T15:17:11.053Z',
      jws:
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..XHGJkrPTqPyPWdtlgtN508qFMnlJVPt9VSs5aUWKvH-msvcQ5mEpLF7YrMlh-mtvoTm5dgS5_MIp1LSkApFQAw',
      proofPurpose: 'assertionMethod',
      verificationMethod:
        'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ#z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
    },
  }
  const id = jsonChecksum(json)
  return (
    <Example
      batch={[
        { type: 'DEMO' },
        { type: 'EXEC' },
        {
          type: 'DEMO_SUCCESS',
          input: [json],
        },
        { type: 'LINKING_DATA_SUCCESS', input: id },
        { type: 'LINKING_DATA_COMPLETE', input: '' },
        { type: 'VERIFIED_CREDENTIAL_SUCCESS', input: id },
        { type: 'VERIFIED_CREDENTIAL_COMPLETE', input: '' },
      ]}
    />
  )
}

export default {
  title: 'State Machine/CounterfeitCredentials',
}
