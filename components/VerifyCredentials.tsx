import cx from 'classnames'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Interpreter } from '../lib/stateMachine'
import { Panel, SuperReadonlyTextarea } from './Formatted'
import ReportRow from './ReportRow'

function VerifyCredentialsRow({
  id,
  state,
  send,
}: {
  id: string
  state: Interpreter['state']
  send: Interpreter['send']
}) {
  const { ids, json, jsonld } = state.context
  const jsonldStatus = jsonld.get(id)
  const [readyState, setReadyState] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [expanded, setExpanded] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (jsonldStatus === 'failure') {
      send({ type: 'VERIFIED_CREDENTIAL_FAILURE', input: id })
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
          const result = await vc.verifyCredential({
            credential: JSON.parse(JSON.stringify(json.get(id))),
            documentLoader,
            suite: new Ed25519Signature2018({}),
          })
          // throw new Error('oooh')
          if (cancelled) return
          if (result.verified) {
            setReadyState('success')
            setExpanded(result.results)
            send({ type: 'VERIFIED_CREDENTIAL_SUCCESS', input: id })
          } else {
            setReadyState('error')
            setError(result.error)
            toast.error(`${id} Failed verification`)
            send({ type: 'VERIFIED_CREDENTIAL_FAILURE', input: id })
          }
        }
      )
      .catch((err) => {
        if (cancelled) return
        setReadyState('error')
        setError(err)
        toast.error(`${id} Failed verification`)
        send({ type: 'VERIFIED_CREDENTIAL_FAILURE', input: id })
      })

    return () => {
      cancelled = true
    }
  }, [])

  const message =
    jsonldStatus === 'failure'
      ? `Skipping verification because of invalid JSON-LD`
      : readyState === 'loading'
      ? 'Verifying Credential...'
      : readyState === 'error'
      ? `Failed verification`
      : 'Credential verified successfully'

  return (
    <Panel
      className={cx({
        'animate-pulse': readyState === 'loading' && jsonldStatus !== 'failure',
      })}
      variant={
        readyState === 'error'
          ? 'error'
          : readyState === 'success'
          ? 'success'
          : 'default'
      }
    >
      {ids.length > 1 ? `${id} ` : ''}
      {message}
      {readyState === 'success' && expanded && (
        <SuperReadonlyTextarea value={JSON.stringify(expanded)} />
      )}
      {readyState === 'error' && error && (
        <div className="rounded py-2 my-1 px-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-20">{`${error}: ${JSON.stringify(
          error
        )}`}</div>
      )}
    </Panel>
  )
}

export default function VerifyCredentials({
  state,
  send,
}: {
  state: Interpreter['state']
  send: Interpreter['send']
}) {
  const { ids, verifiedCredentials } = state.context
  const isCurrent = state.matches('verifyingCredentials')

  useEffect(() => {
    if (isCurrent && verifiedCredentials.size === ids.length) {
      send({ type: 'VERIFIED_CREDENTIAL_COMPLETE', input: '' })
    }
  }, [isCurrent, verifiedCredentials.size, ids.length])

  if (isCurrent || verifiedCredentials.size) {
    return (
      <ReportRow>
        {ids.map((id) => (
          <VerifyCredentialsRow key={id} id={id} send={send} state={state} />
        ))}
      </ReportRow>
    )
  }

  return null
}
