import cx from 'classnames'
import { memo, Suspense, useCallback, useEffect, useState } from 'react'
import { createAsset } from 'use-asset'
import { useMachineSelector, useMachineSend } from '../lib/contexts'
import {
  useCounterfeitCredentials,
  useIdsList,
  useJsonld,
  useJsonMap,
  useVerifiedCredentials,
} from '../lib/selectors'
import ReactDiffViewer from './DS/react-diff-viewer'
import { Panel } from './Formatted'
import ReportRow from './ReportRow'

const work = createAsset(async (json: object) => {
  try {
    const [
      { Ed25519Signature2018 },
      { ld: vc },
      { default: documentLoader },
      { default: faker },
    ] = await Promise.all([
      import('@transmute/ed25519-signature-2018'),
      import('@transmute/vc.js'),
      import('../lib/documentLoader'),
      import('faker'),
    ])

    const results = await Promise.all(
      [
        async (credential) => {
          credential.id = await faker.datatype.uuid()

          return { name: 'Modifying the id', credential }
        },
        async (credential) => {
          credential.credentialSubject.id = await faker.datatype.uuid()

          return { name: 'Modifying the credentialSubject.id', credential }
        },
        async (credential) => {
          const name = 'Removing expirationDate'
          if (!credential.expirationDate) return { name }
          delete credential.expirationDate

          return { name, credential }
        },
        async (credential) => {
          credential.credentialSubject.givenName = faker.name.firstName()
          credential.credentialSubject.familyName = faker.name.lastName()

          return { name: 'Changing the credentialSubject names', credential }
        },
      ].map(async (action) => {
        const counterfeit = await action(JSON.parse(JSON.stringify(json)))

        if (!counterfeit.credential) return counterfeit

        try {
          const result = await vc.verifyCredential({
            credential: counterfeit.credential,
            documentLoader,
            suite: new Ed25519Signature2018({}),
          })

          return {
            name: counterfeit.name,
            credential: counterfeit.credential,
            verified: result.verified,
          }
        } catch {
          // Just skip the ones that fail, most of the time it's @context related
          return {
            name: counterfeit.name,
          }
        }
      })
    )

    const ok = results.some((result) => 'verified' in result)

    if (!ok) {
      return {
        ok: false,
        error: new Error('Failed to run counterfeit tests'),
      }
    }

    return { ok: true, data: results }
  } catch (error) {
    return { ok: false, error }
  }
})

const DiffRow = memo(function DiffRow({
  name,
  original,
  modification,
  verified,
}: {
  name: string
  original: object
  modification: object
  verified: boolean
}) {
  const skipped = verified !== true && verified !== false
  return (
    <div
      className={cx('py-2 bg-white dark:bg-gray-900 rounded-lg', {
        'text-gray-800 dark:text-gray-400': skipped,
        'text-red-800 dark:text-red-400': verified === true && !skipped,
        'text-green-800 dark:text-green-400': verified === false && !skipped,
      })}
    >
      <div className="px-3">
        {skipped ? 'Skipped: ' : verified === true ? 'Failed: ' : 'Detected: '}
        {name}
      </div>
      {!skipped && (
        <div className="overflow-auto rounded my-1 w-[calc(100vw-4rem)] md:w-[calc(100vw-5rem)]">
          <ReactDiffViewer original={original} modification={modification} />
        </div>
      )}
    </div>
  )
})

function CounterfeitCredentialsRow({ id, nu }: { id: string; nu: string }) {
  const send = useMachineSend()
  const json = useJsonMap().get(id)

  const result = work.read(json)

  const success = result.data?.every((item: any) => item.verified !== true)
  const [expanded, setExpanded] = useState(!success)

  useEffect(() => {
    if (result.ok === true) {
      if (success) {
        send({ type: 'COUNTERFEIT_CREDENTIAL_SUCCESS', input: id })
      } else {
        send({ type: 'COUNTERFEIT_CREDENTIAL_FAILURE', input: id })
      }
    }
    if (result.ok === false) {
      send({ type: 'COUNTERFEIT_CREDENTIAL_FAILURE', input: id })
    }
  }, [id, nu, result.ok, send, success])

  if (!result.ok) {
    return (
      <Panel variant="error">
        {nu}
        Unexpected error
        <div className="rounded py-2 my-1 px-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-20">
          {result.error.message}
          {!process.env.STORYBOOK && (
            <>
              <br />
              {result.error.stack}
            </>
          )}
        </div>
      </Panel>
    )
  }

  const message = success
    ? 'Tampering with credentialSubject successfully detected by the signature check'
    : `Able to tamper with credentialSubject without failing the signature check`

  return (
    <Panel variant={success ? 'default' : 'error'}>
      {nu}
      {message}
      <button
        className="float-right focus:outline-none focus:underline font-bold hover:underline text-sm block mt-0.5"
        type="button"
        onClick={() => setExpanded((expanded) => !expanded)}
      >
        {expanded ? 'Collapse' : 'Expand'}
      </button>
      {expanded && (
        <div className="gap-y-2 grid p-1 mt-2 clear-both">
          {result.data.map(({ name, credential, verified }: any) => (
            <DiffRow
              key={name}
              name={name}
              original={json}
              modification={credential}
              verified={verified}
            />
          ))}
        </div>
      )}
    </Panel>
  )
}

function CounterfeitCredentialsRowSuspender({
  id,
  nu,
}: {
  id: string
  nu: string
}) {
  const send = useMachineSend()
  const jsonld = useJsonld()
  const verifiedCredentials = useVerifiedCredentials()
  const jsonldStatus = jsonld.get(id)
  const verifiedCredentialStatus = verifiedCredentials.get(id)

  useEffect(() => {
    if (jsonldStatus === 'failure' || verifiedCredentialStatus === 'failure') {
      send({ type: 'COUNTERFEIT_CREDENTIAL_FAILURE', input: id })
    }
  }, [id, jsonldStatus, send, verifiedCredentialStatus])

  if (jsonldStatus === 'failure') {
    return (
      <Panel>
        {nu} Skipped tampering detection because of the JSON-LD validation
        failing
      </Panel>
    )
  }

  if (verifiedCredentialStatus === 'failure') {
    return (
      <Panel>
        {nu} Skipped tampering detection because of the failed verification
      </Panel>
    )
  }

  return (
    <Suspense
      key={id}
      fallback={
        <Panel className="animate-pulse">
          {nu} Attempting to tamper with credentialSubject and fool the
          signature check...
        </Panel>
      }
    >
      <CounterfeitCredentialsRow id={id} nu={nu} />
    </Suspense>
  )
}

export default function CounterfeitCredentials() {
  const send = useMachineSend()
  const ids = useIdsList()
  const counterfeitCredentials = useCounterfeitCredentials()
  const isCurrent = useMachineSelector(
    useCallback((state) => state.value === 'counterfeitingCredentials', [])
  )

  useEffect(() => {
    if (isCurrent && counterfeitCredentials.size === ids.length) {
      send({ type: 'COUNTERFEIT_CREDENTIAL_COMPLETE', input: '' })
    }
  }, [isCurrent, counterfeitCredentials.size, ids.length, send])

  if (isCurrent || counterfeitCredentials.size) {
    return (
      <ReportRow>
        {ids.map((id, nu) => (
          <CounterfeitCredentialsRowSuspender
            key={id}
            id={id}
            nu={`#${nu + 1} `}
          />
        ))}
      </ReportRow>
    )
  }

  return null
}
