import { jsonChecksum } from '../lib/utils'
import { MachineProvider } from '../lib/storybook'
import VerifyPresentation from './VerifyPresentation'

import verifiableCredentials from '../fixtures.json'
import Header from './Header'

function Example({ batch }: { batch: any[] }) {
  return (
    <div className="w-screen min-h-screen pt-20">
      <MachineProvider batch={batch}>
        <Header />
        <VerifyPresentation />
      </MachineProvider>
    </div>
  )
}

export const Failure = () => {
  const failedLinkingData = verifiableCredentials[0]
  const failedVerifiedCredential = verifiableCredentials[1]
  const failedCounterfeitCredential = verifiableCredentials[2]
  const luckyOne = verifiableCredentials[3]

  const failedLinkingDataId = jsonChecksum(failedLinkingData)
  const failedVerifiedCredentialId = jsonChecksum(failedVerifiedCredential)
  const failedCounterfeitCredentialId = jsonChecksum(
    failedCounterfeitCredential
  )
  const luckyOneId = jsonChecksum(luckyOne)

  return (
    <Example
      batch={[
        { type: 'DEMO' },
        { type: 'EXEC' },
        {
          type: 'DEMO_SUCCESS',
          input: [
            failedLinkingData,
            failedVerifiedCredential,
            failedCounterfeitCredential,
            luckyOne,
          ],
        },
        { type: 'LINKING_DATA_FAILURE', input: failedLinkingDataId },
        { type: 'LINKING_DATA_SUCCESS', input: failedVerifiedCredentialId },
        { type: 'LINKING_DATA_SUCCESS', input: failedCounterfeitCredentialId },
        { type: 'LINKING_DATA_SUCCESS', input: luckyOneId },
        { type: 'LINKING_DATA_COMPLETE', input: '' },
        { type: 'VERIFIED_CREDENTIAL_FAILURE', input: failedLinkingDataId },
        {
          type: 'VERIFIED_CREDENTIAL_FAILURE',
          input: failedVerifiedCredentialId,
        },
        {
          type: 'VERIFIED_CREDENTIAL_SUCCESS',
          input: failedCounterfeitCredentialId,
        },
        { type: 'VERIFIED_CREDENTIAL_SUCCESS', input: luckyOneId },
        { type: 'VERIFIED_CREDENTIAL_COMPLETE', input: '' },
        { type: 'COUNTERFEIT_CREDENTIAL_FAILURE', input: failedLinkingDataId },
        {
          type: 'COUNTERFEIT_CREDENTIAL_FAILURE',
          input: failedVerifiedCredentialId,
        },
        {
          type: 'COUNTERFEIT_CREDENTIAL_FAILURE',
          input: failedCounterfeitCredentialId,
        },
        { type: 'COUNTERFEIT_CREDENTIAL_SUCCESS', input: luckyOneId },
        { type: 'COUNTERFEIT_CREDENTIAL_COMPLETE', input: '' },
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
        { type: 'VERIFIED_CREDENTIAL_SUCCESS', input: id },
        { type: 'VERIFIED_CREDENTIAL_COMPLETE', input: '' },
        { type: 'COUNTERFEIT_CREDENTIAL_SUCCESS', input: id },
        { type: 'COUNTERFEIT_CREDENTIAL_COMPLETE', input: '' },
      ]}
    />
  )
}

export default {
  title: 'State Machine/VerifyPresentation',
}
