import { jsonChecksum } from '../lib/utils'
import { MachineProvider } from '../lib/storybook'
import VerifyCredentials from './VerifyCredentials'

import verifiableCredentials from '../fixtures.json'
import Header from './Header'

function Example({ batch }: { batch: any[] }) {
  return (
    <div className="w-screen min-h-screen pt-20">
      <MachineProvider batch={batch}>
        <Header />
        <VerifyCredentials />
      </MachineProvider>
    </div>
  )
}

export const Failure = () => {
  const skippedJson = verifiableCredentials[0]
  const failedJson = verifiableCredentials[1]

  const skippedJsonId = jsonChecksum(skippedJson)
  const failedJsonId = jsonChecksum(failedJson)
  return (
    <Example
      batch={[
        { type: 'DEMO' },
        { type: 'EXEC' },
        {
          type: 'DEMO_SUCCESS',
          input: [skippedJson, failedJson],
        },
        { type: 'LINKING_DATA_FAILURE', input: skippedJsonId },
        { type: 'LINKING_DATA_SUCCESS', input: failedJsonId },
        { type: 'LINKING_DATA_COMPLETE', input: '' },
      ]}
    />
  )
}

export const Success = () => {
  const json = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://www.w3.org/2018/credentials/examples/v1',
    ],
    type: ['VerifiableCredential', 'UniversityDegreeCredential'],
    credentialSubject: {
      id: 'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
      givenName: 'Ben',
      familyName: 'Von',
      degree: {
        type: 'BachelorDegree',
        name: 'Bachelor of Partnerships and Deliverables',
      },
    },
    id: 'http://example.gov/credentials/3732',
    issuer: 'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
    issuanceDate: '2021-03-15T06:35:33.072Z',
    proof: {
      type: 'Ed25519Signature2018',
      created: '2021-03-15T06:35:33.945Z',
      jws:
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..L9cCEQfUqjBnJ7AAmuBpnxnxPcl2UuMhQdqrOmYrBl-mLnfnidl8EKUdFCtl0-qXVlQFtEjj6eHWEOTuiu0hAQ',
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
      ]}
    />
  )
}

export default {
  title: 'State Machine/VerifyCredentials',
}
