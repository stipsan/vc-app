import { unstable_batchedUpdates } from 'react-dom'
import cx from 'classnames'
import produce from 'immer'
import { useCallback, useEffect, useState, memo, Suspense } from 'react'
import toast from 'react-hot-toast'
import create from 'zustand'
import {
  useMachineSelector,
  useMachineSend,
  useMachineState,
} from '../lib/contexts'
import { DocumentLoader, documentLoaderStore, LogsState } from '../lib/utils'
import DocumentLoaderLogs from './DocumentLoaderLogs'
import { Panel, SuperReadonlyTextarea } from './Formatted'
import ReportRow from './ReportRow'
import { useJsonld } from '../lib/selectors'

const useLogs = create<LogsState>((set) => ({
  urls: {},
  set: (url, entry) =>
    set(
      produce((state) => {
        if (entry === 'loading' && url in state.urls) {
          return
        }
        if (entry !== 'loading' && state.urls[url] !== 'loading') {
          return
        }

        state.urls[url] = entry
      })
    ),
}))

function VerifyCredentialsRow({
  id,
  nu,
  documentLoader,
}: {
  id: string
  nu: string
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
          toast.error(`${nu} Failed verification`)
          send({ type: 'VERIFIED_CREDENTIAL_FAILURE', input: id })
        }
        setExpanded(result)
      })
      .catch((err) => {
        if (cancelled) return
        setReadyState('error')
        setError(err)
        toast.error(`${nu} Failed verification`)
        send({ type: 'VERIFIED_CREDENTIAL_FAILURE', input: id })
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {ids.length > 1 ? `${nu} ` : ''}
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

function VerifyCredentialsRowSuspender({
  id,
  nu,
  documentLoader,
}: {
  id: string
  nu: string
  documentLoader: DocumentLoader
}) {
  const send = useMachineSend()
  const jsonld = useJsonld()
  const jsonldStatus = jsonld.get(id)

  useEffect(() => {
    if (jsonldStatus === 'failure') {
      send({ type: 'VERIFIED_CREDENTIAL_FAILURE', input: id })
    }
  }, [id, jsonldStatus, send])

  if (jsonldStatus === 'failure') {
    return <Panel>{nu} Skipping verification because of invalid JSON-LD</Panel>
  }

  return (
    <Suspense
      key={id}
      fallback={
        <Panel className="animate-pulse">{nu} Verifying Credential...</Panel>
      }
    >
      <VerifyCredentialsRow id={id} nu={nu} documentLoader={documentLoader} />
    </Suspense>
  )
}

const VerifyCredentialsDocumentLoaderLogs = memo(
  ({ loading }: { loading: boolean }) => {
    const log = useLogs(useCallback((state) => state.urls, []))

    return <DocumentLoaderLogs loading={loading} log={log} />
  }
)

export default function VerifyCredentials() {
  const updateLog = useLogs(useCallback((state) => state.set, []))
  const send = useMachineSend()
  const state = useMachineState()
  const { ids, verifiedCredentials } = state.context
  const isCurrent = state.matches('verifyingCredentials')
  const realDocumentLoader = documentLoaderStore(
    useCallback((state) => state.documentLoader, [])
  )
  const documentLoader = useCallback(
    async (url: string) => {
      unstable_batchedUpdates(() => {
        updateLog(url, 'loading')
      })
      try {
        const result = await realDocumentLoader(url)

        unstable_batchedUpdates(() => {
          updateLog(url, JSON.parse(JSON.stringify(result)))
        })
        return result
      } catch (err) {
        unstable_batchedUpdates(() => {
          updateLog(url, err)
        })
        throw err
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateLog]
  )

  useEffect(() => {
    if (isCurrent && verifiedCredentials.size === ids.length) {
      send({ type: 'VERIFIED_CREDENTIAL_COMPLETE', input: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrent, verifiedCredentials.size, ids.length])

  if (isCurrent || verifiedCredentials.size) {
    return (
      <ReportRow>
        <VerifyCredentialsDocumentLoaderLogs loading={isCurrent} />
        {ids.map((id, nu) => (
          <VerifyCredentialsRowSuspender
            key={id}
            id={id}
            nu={`#${nu + 1} `}
            documentLoader={documentLoader}
          />
        ))}
      </ReportRow>
    )
  }

  return null
}
