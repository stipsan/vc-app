import cx from 'classnames'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useImmer } from 'use-immer'
import { useMachineSend, useMachineState } from '../lib/contexts'
import type { LogsMap } from '../lib/documentLoader'
import DocumentLoaderLogs from './DocumentLoaderLogs'
import { Panel, SuperReadonlyTextarea } from './Formatted'
import ReportRow from './ReportRow'
import { documentLoaderStore, DocumentLoader, LogsState } from '../lib/utils'
import create from 'zustand'

const useLogs = create<LogsState>((set) => ({
  urls: {},
  set: (url, entry) => {
    set((state) => ({ urls: { ...state.urls, [url]: entry } }))
  },
}))

function VerifyCredentialsRow({
  id,
  documentLoader,
}: {
  id: string
  documentLoader: DocumentLoader
}) {
  const send = useMachineSend()
  const state = useMachineState()
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
    ])
      .then(async ([{ Ed25519Signature2018 }, { ld: vc }]) => {
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
        setExpanded(result)
      })
      .catch((err) => {
        if (cancelled) return
        alert(true)
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
      {expanded && <SuperReadonlyTextarea value={JSON.stringify(expanded)} />}
      {readyState === 'error' && error && (
        <div className="rounded py-2 my-1 px-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-20">
          {error.message}
          <br />
          {error.stack}
        </div>
      )}
    </Panel>
  )
}

export default function VerifyCredentials() {
  const log = useLogs((state) => state.urls)
  const updateLog = useLogs((state) => state.set)
  const send = useMachineSend()
  const state = useMachineState()
  const { ids, verifiedCredentials } = state.context
  const isCurrent = state.matches('verifyingCredentials')
  const realDocumentLoader = documentLoaderStore(
    (state) => state.documentLoader
  )
  const documentLoader = useCallback(
    async (url: string) => {
      updateLog(url, 'loading')
      try {
        const result = await realDocumentLoader(url)

        updateLog(url, JSON.parse(JSON.stringify(result)))
        return result
      } catch (err) {
        updateLog(url, err)
        throw err
      }
    },
    [updateLog]
  )
  console.log('VerifyCredentials', { log })

  useEffect(() => {
    if (isCurrent && verifiedCredentials.size === ids.length) {
      send({ type: 'VERIFIED_CREDENTIAL_COMPLETE', input: '' })
    }
  }, [isCurrent, verifiedCredentials.size, ids.length])

  if (isCurrent || verifiedCredentials.size) {
    return (
      <ReportRow>
        <DocumentLoaderLogs
          loading={isCurrent}
          log={log}
          updateLog={updateLog}
        />
        {ids.map((id) => (
          <VerifyCredentialsRow
            key={id}
            id={id}
            documentLoader={documentLoader}
          />
        ))}
      </ReportRow>
    )
  }

  return null
}
