import { Ed25519Signature2018 } from '@transmute/ed25519-signature-2018'
import { ld as vc } from '@transmute/vc.js'
import cx from 'classnames'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import documentLoader from '../lib/documentLoader'
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

    vc.verifyCredential({
      credential: JSON.parse(JSON.stringify(json.get(id))),
      documentLoader,
      suite: new Ed25519Signature2018({}),
    })
      .then(async (result) => {
        await new Promise((resolve) => setTimeout(() => resolve(null), 3000))

        // throw new Error('oooh')
        if (cancelled) return
        if (result.verified) {
          setReadyState('success')
          setExpanded(result.results)
          send({ type: 'VERIFIED_CREDENTIAL_SUCCESS', input: id })
        } else {
          setReadyState('error')
          setError(result.error)
          send({ type: 'VERIFIED_CREDENTIAL_FAILURE', input: id })
        }
      })
      .catch((err) => {
        if (cancelled) return
        setReadyState('error')
        setError(err)
        send({ type: 'VERIFIED_CREDENTIAL_FAILURE', input: id })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Panel
      className={cx({
        'bg-blue-50 text-black text-opacity-80':
          readyState === 'loading' || jsonldStatus === 'failure',
        'animate-pulse': readyState === 'loading' && jsonldStatus !== 'failure',
        'text-red-900 bg-red-50': readyState === 'error',
        'text-green-900 bg-green-50': readyState === 'success',
      })}
    >
      {ids.length > 1 ? `${id} ` : ''}
      {jsonldStatus === 'failure'
        ? `Skipping verification because of invalid JSON-LD`
        : readyState === 'loading'
        ? 'Verifying Credential...'
        : readyState === 'error'
        ? `Failed verification`
        : 'Credential verified successfully'}
      {readyState === 'success' && expanded && (
        <SuperReadonlyTextarea value={JSON.stringify(expanded)} />
      )}
      {readyState === 'error' && error && (
        <div className="rounded py-2 my-1 px-3 bg-red-100">{`${error}: ${JSON.stringify(
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
