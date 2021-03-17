import ReactJason from './react-jason'
import { useReducer, useState } from 'react'
import cx from 'classnames'

import verifiableCredentials from '../../fixtures.json'

function Example({
  value,
  variant = 'all',
}: {
  value: unknown
  variant?: string
}) {
  const [quoteAttributes, setQuoteAttributes] = useReducer(
    (prev) => !prev,
    true
  )
  const variants = ['normal', 'failure', 'success']
  const [sortKeys, setSortKeys] = useReducer((prev) => !prev, false)
  const [selected, setVariant] = useState(variant)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        Quote properties
        <input
          className="ml-2"
          type="checkbox"
          onChange={setQuoteAttributes}
          checked={quoteAttributes}
        />
      </label>

      <label className="inline-flex items-center">
        Sort keys
        <input
          className="ml-2"
          type="checkbox"
          onChange={setSortKeys}
          checked={sortKeys}
        />
      </label>
      {(selected === 'all' ? variants : [selected]).map((variant) => (
        <div
          key={variant}
          className={cx(selected !== 'all' && 'md:col-span-3')}
        >
          {[].concat(value).map((value, i) => (
            <div
              key={i}
              className={cx('rounded-lg py-2 px-3 mb-4', {
                'bg-gray-50 dark:bg-gray-800 text-black dark:text-white text-opacity-80':
                  variant === 'normal',
                'text-red-900 dark:text-red-500 bg-red-50 dark:bg-opacity-20 dark:bg-red-900':
                  variant === 'failure',
                'text-green-900 dark:text-green-500 bg-green-50 dark:bg-opacity-25 dark:bg-green-900':
                  variant === 'success',
              })}
            >
              #{i + 1} Heading
              <div
                className={cx('overflow-hidden rounded py-2 my-1 px-3', {
                  'bg-gray-100 dark:bg-gray-700': variant === 'normal',
                  'bg-red-100 dark:bg-red-900 dark:bg-opacity-20':
                    variant === 'failure',
                  'bg-green-100 dark:bg-opacity-25 dark:bg-green-900':
                    variant === 'success',
                })}
              >
                <ReactJason
                  value={value}
                  quoteAttributes={quoteAttributes}
                  sortKeys={sortKeys}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export const VerifiableCredential = () => (
  <Example
    value={{
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1',
      ],
      id: 'http://example.gov/credentials/3732',
      type: ['VerifiableCredential', 'UniversityDegreeCredential'],
      issuer: {
        id: 'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
      },
      issuanceDate: '2021-03-15T01:00:55.111Z',
      credentialSubject: {
        id: 'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
        givenName: 'Carlee',
        familyName: 'Upton',
        degree: {
          type: 'BachelorDegree',
          name: 'Bachelor of Web Services and E-Markets',
        },
      },
      proof: {
        type: 'Ed25519Signature2018',
        created: '2021-03-15T01:00:55.188Z',
        jws:
          'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..LqKlVIAsVTZKAQVRhWr_zE-AulHuGiDL1YHPya26m-GHPDSZO6vNUnkCkVXxFniCjxvn48fcuHfQxNID56oeCQ',
        proofPurpose: 'assertionMethod',
        verificationMethod:
          'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ#z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
      },
    }}
    variant="normal"
  />
)

export const VerifiableCredentials = () => (
  <Example value={verifiableCredentials} variant="normal" />
)

export const Error = () => (
  <Example value={new TypeError(`Uh oh huh`)} variant="failure" />
)

export const VerificationResult = () => (
  <Example
    variant="success"
    value={{
      verified: true,
      results: [
        {
          proof: {
            '@context': 'https://w3id.org/security/v2',
            type: 'Ed25519Signature2018',
            created: '2021-03-14T22:07:21.529Z',
            jws:
              'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..1OXspJZI0-1LMGAznPXChrD06AJKU8jvbK2s3DLL6xxrPHu4MJCuCR72WDYlowTJGL-8swUvaGa8sUKdn1HRCw',
            proofPurpose: 'assertionMethod',
            verificationMethod:
              'did:key:z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ#z6MkpP568Jfkc1n51vdEut2EebtvhFXkod7S6LMZTVPGsZiZ',
          },
          verified: true,
          purposeResult: { valid: true },
        },
      ],
    }}
  />
)

export const JSON = () => (
  <Example
    value={{
      string: 'Hello, GitHub',
      number: 123.45,
      boolean: true,
      null: null,
      array: ['one', 'two', 'three'],
      object: {
        nested: {
          fields: 'yes',
        },
      },
      keyedArray: [
        {
          _key: 'abc',
          _type: 'span',
          text: 'Coolio',
        },
        {
          _key: 'xyz',
          _type: 'span',
          text: 'Yes',
        },
      ],
    }}
  />
)

export default {
  title: 'Design System/Rich Formatting/react-jason',
}
