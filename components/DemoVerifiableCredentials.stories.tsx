import { MachineProvider } from '../lib/storybook'
import DemoVerifiableCredentials from './DemoVerifiableCredentials'
import Header from './Header'

function Example({ batch, result }: { batch: any[]; result?: any }) {
  return (
    <div className="w-screen min-h-screen pt-20">
      <MachineProvider batch={batch}>
        <Header />
        <DemoVerifiableCredentials defaultResult={result} />
      </MachineProvider>
    </div>
  )
}

export const Failure = () => {
  return (
    <Example
      batch={[{ type: 'DEMO' }, { type: 'EXEC' }, { type: 'DEMO_FAILURE' }]}
      result={{
        ok: false,
        error: new TypeError('Failed for the sake of failing!'),
      }}
    />
  )
}

export const Success = () => {
  const data = [
    {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1',
      ],
      type: ['VerifiableCredential', 'UniversityDegreeCredential'],
      credentialSubject: {},
      id: 'http://example.gov/credentials/3732',
      issuer: 'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
      issuanceDate: '2021-03-15T05:32:18.145Z',
      proof: {
        type: 'Ed25519Signature2018',
        created: '2021-03-15T05:32:18.306Z',
        jws:
          'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..HSM4a-itfO8ySeXlR56DwlhcJDQbKVx91fG7_VJFWX9TACKwrl3a8LZlvftYSrx-C9jcModbhGltOTSpiST6Ag',
        proofPurpose: 'assertionMethod',
        verificationMethod:
          'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ#z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
      },
    },
    {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1',
      ],
      id: 'http://example.gov/credentials/3732',
      type: ['VerifiableCredential', 'UniversityDegreeCredential'],
      issuer: {
        id: 'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
      },
      issuanceDate: '2021-03-15T05:34:22.984Z',
      credentialSubject: {
        id: 'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
        givenName: 'Tamara',
        familyName: 'Schaefer',
        degree: {
          type: 'BachelorDegree',
          name: 'Bachelor of Portals and Mindshare',
        },
      },
      proof: {
        type: 'Ed25519Signature2018',
        created: '2021-03-15T05:34:23.101Z',
        jws:
          'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..DSPD8lICqZOUcT-_exFup75ZWwSU2KcPaAFHYtdARXa603812gVfqFAbGDWqOeKTvSAvYvLncF1N8d6b5G5BBA',
        proofPurpose: 'assertionMethod',
        verificationMethod:
          'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ#z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
      },
    },
  ]
  return (
    <Example
      batch={[
        { type: 'DEMO' },
        { type: 'EXEC' },
        { type: 'DEMO_SUCCESS', input: data },
      ]}
      result={{ ok: true, data }}
    />
  )
}

export const E2E = () => {
  return <Example batch={[{ type: 'DEMO' }, { type: 'EXEC' }]} />
}

export default {
  title: 'State Machine/DemoVerifiableCredentials',
}
