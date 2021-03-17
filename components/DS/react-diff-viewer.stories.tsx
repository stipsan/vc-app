import ReactDiffViewer from './react-diff-viewer'
import { useReducer, useState } from 'react'
import cx from 'classnames'

import verifiableCredentials from '../../fixtures.json'
const json = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://www.w3.org/2018/credentials/examples/v1',
  ],
  id: 'http://example.gov/credentials/3732',
  type: ['VerifiableCredential', 'UniversityDegreeCredential'],
  issuer: { id: 'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ' },
  issuanceDate: '2021-03-15T00:59:21.667Z',
  credentialSubject: {
    id: 'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
    givenName: 'Rossie',
    familyName: 'Rohan',
    degree: {
      type: 'BachelorDegree',
      name: 'Bachelor of Users and Web-Readiness',
    },
  },
  proof: {
    type: 'Ed25519Signature2018',
    created: '2021-03-15T00:59:21.966Z',
    jws:
      'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..V2SKpJBRfe3rdwxXbpjd7a7hZeh9efwrr2H579ld3FVEJXl4ic1KsZLcMEORZ5NFMkwAlZWZME4iChV5eOxXBA',
    proofPurpose: 'assertionMethod',
    verificationMethod:
      'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ#z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
  },
}

function Example({
  original,
  modification,
  variant = 'all',
}: {
  original: object
  modification: object
  variant?: string
}) {
  const [disableWordDiff, setDisableWordDiff] = useReducer(
    (prev) => !prev,
    false
  )
  const variants = ['normal', 'failure', 'success']
  const [splitView, setSplitView] = useReducer((prev) => !prev, false)
  const [selected, setVariant] = useState(variant)
  const [diffMethod, setDiffMethod] = useState('diffWords')

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label className="inline-flex items-center">
        Variant
        <select
          className="ml-2"
          value={selected}
          onChange={(event) => setVariant(event.target.value)}
        >
          <option key="all">all</option>
          {variants.map((variant) => (
            <option key={variant}>{variant}</option>
          ))}
        </select>
      </label>
      <label className="inline-flex items-center">
        Diffing method
        <select
          className="ml-2"
          value={diffMethod}
          onChange={(event) => setDiffMethod(event.target.value)}
        >
          {[
            'diffChars',
            'diffWords',
            'diffWordsWithSpace',
            'diffLines',
            'diffTrimmedLines',
            'diffSentences',
            'diffCss',
          ].map((diffMethod) => (
            <option key={diffMethod}>{diffMethod}</option>
          ))}
        </select>
      </label>
      <label className="inline-flex items-center">
        Show and hide word diff in a diff line.
        <input
          className="ml-2"
          type="checkbox"
          onChange={setDisableWordDiff}
          checked={disableWordDiff}
        />
      </label>

      <label className="inline-flex items-center">
        Switch between unified and split view.
        <input
          className="ml-2"
          type="checkbox"
          onChange={setSplitView}
          checked={splitView}
        />
      </label>
      {(selected === 'all' ? variants : [selected]).map((variant) => (
        <div
          key={variant}
          className={cx(
            'rounded-lg py-2 px-3 mb-4',
            {
              'bg-gray-50 dark:bg-gray-800 text-black dark:text-white text-opacity-80':
                variant === 'normal',
              'text-red-900 dark:text-red-500 bg-red-50 dark:bg-opacity-20 dark:bg-red-900':
                variant === 'failure',
              'text-green-900 dark:text-green-500 bg-green-50 dark:bg-opacity-25 dark:bg-green-900':
                variant === 'success',
            },
            selected !== 'all' && 'md:col-span-2'
          )}
        >
          Heading
          <div className="overflow-auto rounded py-1 my-1 bg-white dark:bg-gray-900 dark:text-white">
            <ReactDiffViewer
              original={original}
              modification={modification}
              splitView={splitView}
              disableWordDiff={disableWordDiff}
              // @ts-expect-error
              compareMethod={diffMethod}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export const CounterfeitCredentialsChangingTheID = () => {
  const original = json
  const modified = {
    ...original,
    credentialSubject: {
      ...original.credentialSubject,
      id: new Date().toISOString(),
    },
  }
  return (
    <Example original={original} modification={modified} variant="normal" />
  )
}

export const CounterfeitCredentialAddingAnID = () => {
  const original = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://www.w3.org/2018/credentials/examples/v1',
    ],
    type: ['VerifiableCredential', 'UniversityDegreeCredential'],
    credentialSubject: {},
    id: 'http://example.gov/credentials/3732',
    issuer: 'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
    issuanceDate: '2021-03-15T04:09:24.056Z',
    proof: {
      type: 'Ed25519Signature2018',
      created: '2021-03-15T04:09:24.126Z',
      jws:
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..IlcaQul4FYAC5IhSCOCt_abfF60OoffZQTjo81GxfIJ3dWDwAnsHVmUTkEOanL3-a-pUDSEXPV1jXu8fGuZ2Bw',
      proofPurpose: 'assertionMethod',
      verificationMethod:
        'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ#z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
    },
  }
  const modified = {
    ...original,
    credentialSubject: { id: new Date().toISOString() },
  }
  return (
    <Example original={original} modification={modified} variant="normal" />
  )
}

export const CounterfeitCredentialsExtendingExpiry = () => {
  const original = verifiableCredentials[0]
  const expirationDate = original.expirationDate
    ? new Date(original.expirationDate)
    : new Date()
  expirationDate.setFullYear(new Date().getFullYear() + 1)
  const modified = { ...original, expirationDate: expirationDate.toISOString() }
  return (
    <Example original={original} modification={modified} variant="normal" />
  )
}

export const CounterfeitCredentialsRemovedExpiry = () => {
  const original = verifiableCredentials[0]
  const { expirationDate, ...modified } = original
  return (
    <Example original={original} modification={modified} variant="normal" />
  )
}

export const JSONLD = () => {
  return (
    <Example
      original={[
        {
          'https://www.w3.org/2018/credentials#credentialSubject': [
            {
              '@id': 'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
            },
          ],
          '@id': 'http://example.gov/credentials/3732',
          'https://www.w3.org/2018/credentials#issuanceDate': [
            {
              '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
              '@value': '2021-03-15T10:04:45.807Z',
            },
          ],
          'https://www.w3.org/2018/credentials#issuer': [
            {
              '@id': 'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
            },
          ],
          'https://w3id.org/security#proof': [
            {
              '@graph': [
                {
                  'http://purl.org/dc/terms/created': [
                    {
                      '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
                      '@value': '2021-03-15T10:04:45.983Z',
                    },
                  ],
                  'https://w3id.org/security#jws': [
                    {
                      '@value':
                        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..sxBwOYfrXb2xF4cPerwXys7PfY3La2lZLmBM4Cdn1D_n8GZ3j_44LU_80KY-7NTm8t_Qw8Q_rNylxQFkbIezAw',
                    },
                  ],
                  'https://w3id.org/security#proofPurpose': [
                    { '@id': 'https://w3id.org/security#assertionMethod' },
                  ],
                  '@type': ['https://w3id.org/security#Ed25519Signature2018'],
                  'https://w3id.org/security#verificationMethod': [
                    {
                      '@id':
                        'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ#z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
                    },
                  ],
                },
              ],
            },
          ],
          '@type': [
            'https://www.w3.org/2018/credentials#VerifiableCredential',
            'https://example.org/examples#UniversityDegreeCredential',
          ],
        },
      ]}
      modification={[
        {
          'https://www.w3.org/2018/credentials#credentialSubject': [
            {
              '@id': 'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
            },
          ],
          '@id': '079a4a7c-9246-4877-99e8-fc882ff6c0b7',
          'https://www.w3.org/2018/credentials#issuanceDate': [
            {
              '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
              '@value': '2021-03-15T10:05:54.767Z',
            },
          ],
          'https://www.w3.org/2018/credentials#issuer': [
            {
              '@id': 'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
            },
          ],
          'https://w3id.org/security#proof': [
            {
              '@graph': [
                {
                  'http://purl.org/dc/terms/created': [
                    {
                      '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
                      '@value': '2021-03-15T10:05:54.876Z',
                    },
                  ],
                  'https://w3id.org/security#jws': [
                    {
                      '@value':
                        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..A5y1WWPJiUTYebxhgjV08FwhYzbBBBv_Z8zj8JaFK_mCgjW-XqY_N0NuhmaqsW8qJUgZj9ZDMvB2vJFRVpP5AQ',
                    },
                  ],
                  'https://w3id.org/security#proofPurpose': [
                    { '@id': 'https://w3id.org/security#assertionMethod' },
                  ],
                  '@type': ['https://w3id.org/security#Ed25519Signature2018'],
                  'https://w3id.org/security#verificationMethod': [
                    {
                      '@id':
                        'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ#z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
                    },
                  ],
                },
              ],
            },
          ],
          '@type': [
            'https://www.w3.org/2018/credentials#VerifiableCredential',
            'https://example.org/examples#UniversityDegreeCredential',
          ],
        },
      ]}
      variant="normal"
    />
  )
}

export default {
  title: 'Design System/Rich Formatting/react-diff-viewer',
}
