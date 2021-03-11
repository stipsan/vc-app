import cx from 'classnames'
import { useEffect, useState } from 'react'
import { Interpreter } from '../lib/stateMachine'
import { Panel, SuperReadonlyTextarea } from './Formatted'
import ReportRow from './ReportRow'

function TamperingDetectorRow({
  id,
  state,
  send,
}: {
  id: string
  state: Interpreter['state']
  send: Interpreter['send']
}) {
  const { ids, json, jsonld, verifiedCredentials } = state.context
  const jsonldStatus = jsonld.get(id)
  const verifiedCredentialStatus = verifiedCredentials.get(id)
  const [readyState, setReadyState] = useState<
    'loading' | 'success' | 'failure' | 'error'
  >('loading')
  const [expanded, setExpanded] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (jsonldStatus === 'failure' || verifiedCredentialStatus === 'failure') {
      send({ type: 'COUNTERFEIT_CREDENTIAL_FAILURE', input: id })
      return
    }

    let cancelled = false

    Promise.all([
      import('@transmute/ed25519-signature-2018'),
      import('@transmute/vc.js'),
      import('../lib/documentLoader'),
    ])
      .then(
        async ([
          { Ed25519Signature2018 },
          { ld: vc },
          { default: documentLoader },
        ]) => {
          if (cancelled) return

          const clone = JSON.parse(JSON.stringify(json.get(id)))
          clone.credentialSubject.id = new Date()
          const result = await vc.verifyCredential({
            credential: clone,
            documentLoader,
            suite: new Ed25519Signature2018({}),
          })
          console.debug(
            'vc.verifyCredential result for',
            { id, json: json.get(id) },
            'after editing credentialSubject.id',
            result
          )
          if (cancelled) return
          if (result.verified) {
            setReadyState('failure')
            setExpanded(result.results)
            send({ type: 'COUNTERFEIT_CREDENTIAL_FAILURE', input: id })
          } else {
            setReadyState('success')
            setError(result.error)
            send({ type: 'COUNTERFEIT_CREDENTIAL_SUCCESS', input: id })
          }
        }
      )
      .catch((err) => {
        if (cancelled) return
        setReadyState('error')
        setError(err)
        send({ type: 'COUNTERFEIT_CREDENTIAL_FAILURE', input: id })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Panel
      className={cx({
        'bg-blue-50 dark:bg-gray-800 text-black dark:text-white text-opacity-80':
          readyState === 'loading' ||
          verifiedCredentialStatus === 'failure' ||
          jsonldStatus === 'failure',
        'animate-pulse':
          readyState === 'loading' &&
          verifiedCredentialStatus !== 'failure' &&
          jsonldStatus !== 'failure',
        'text-red-900 dark:text-red-500 bg-red-50 dark:bg-opacity-20 dark:bg-red-900':
          readyState === 'error' || readyState === 'failure',
        'text-green-900 dark:text-green-500 bg-green-50 dark:bg-opacity-25 dark:bg-green-900':
          readyState === 'success',
      })}
    >
      {ids.length > 1 ? `${id} ` : ''}
      {jsonldStatus === 'failure'
        ? `Skipped tampering detection because of the JSON-LD validation failing`
        : verifiedCredentialStatus === 'failure'
        ? `Skipped tampering detection because of the failed verification`
        : readyState === 'loading'
        ? 'Attempting to tamper with credentialSubject and fool the signature check...'
        : readyState === 'error'
        ? `Unexpected error`
        : readyState === 'failure'
        ? `Able to tamper with credentialSubject without failing the signature check`
        : 'Tampering with credentialSubject successfully detected by the signature check'}
      {readyState === 'success' && error && (
        <SuperReadonlyTextarea value={JSON.stringify(error)} />
      )}
      {readyState === 'failure' && expanded && (
        <SuperReadonlyTextarea
          className="bg-red-100 dark:bg-red-900 dark:bg-opacity-20 focus:ring-inset focus:ring-red-200 dark:focus:ring-red-900 focus:ring-2"
          value={JSON.stringify(expanded)}
        />
      )}
      {readyState === 'error' && error && (
        <div className="rounded py-2 my-1 px-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-20">{`${error}: ${JSON.stringify(
          error
        )}`}</div>
      )}
    </Panel>
  )
}

export default function TamperingDetector({
  state,
  send,
}: {
  state: Interpreter['state']
  send: Interpreter['send']
}) {
  const { ids, counterfeitCredentials } = state.context
  const isCurrent = state.matches('counterfeitingCredentials')

  useEffect(() => {
    if (isCurrent && counterfeitCredentials.size === ids.length) {
      send({ type: 'COUNTERFEIT_CREDENTIAL_COMPLETE', input: '' })
    }
  }, [isCurrent, counterfeitCredentials.size, ids.length])

  if (isCurrent || counterfeitCredentials.size) {
    return (
      <ReportRow>
        {ids.map((id) => (
          <TamperingDetectorRow key={id} id={id} state={state} send={send} />
        ))}
      </ReportRow>
    )
  }

  return null
}
