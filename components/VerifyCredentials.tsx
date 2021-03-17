import produce from 'immer'
import { memo, Suspense, useCallback, useEffect } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import toast from 'react-hot-toast'
import { createAsset } from 'use-asset'
import create from 'zustand'
import {
  useMachineSelector,
  useMachineSend,
  useOnMachineReset,
} from '../lib/contexts'
import type { DocumentLoader } from '../lib/documentLoader'
import {
  useIdsList,
  useJsonld,
  useJsonMap,
  useVerifiedCredentials,
} from '../lib/selectors'
import { LogsState } from '../lib/utils'
import DocumentLoaderLogs from './DocumentLoaderLogs'
import { Panel, SuperReadonlyTextarea } from './Formatted'
import ReportRow from './ReportRow'

const work = createAsset(
  async (documentLoader: DocumentLoader, json: object) => {
    try {
      const [{ Ed25519Signature2018 }, { ld: vc }] = await Promise.all([
        import('@transmute/ed25519-signature-2018'),
        import('@transmute/vc.js'),
      ])

      const result = await vc.verifyCredential({
        credential: JSON.parse(JSON.stringify(json)),
        documentLoader,
        suite: new Ed25519Signature2018({}),
      })

      if (result.verified) {
        return { ok: true, data: result }
      } else {
        return { ok: false, data: result, error: result.error }
      }
    } catch (error) {
      return { ok: false, error }
    }
  }
)

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
  const json = useJsonMap().get(id)

  const result = work.read(documentLoader, json)

  useEffect(() => {
    if (result.ok === true) {
      send({ type: 'VERIFIED_CREDENTIAL_SUCCESS', input: id })
    }
    if (result.ok === false) {
      toast.error(`${nu} Failed verification`)
      send({ type: 'VERIFIED_CREDENTIAL_FAILURE', input: id })
    }
  }, [id, nu, result.ok, send])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => work.clear(documentLoader, json), [])

  switch (result.ok) {
    case false:
      return (
        <Panel variant="error">
          {nu}
          Failed verification
          {result.data && (
            <SuperReadonlyTextarea value={JSON.stringify(result.data)} />
          )}
          <div className="rounded py-2 my-1 px-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-20">
            {result.error.message}
            <br />
            {result.error.stack}
          </div>
        </Panel>
      )
    case true:
      return (
        <Panel variant="success">
          {nu}
          Credential verified successfully
          <SuperReadonlyTextarea value={JSON.stringify(result.data)} />
        </Panel>
      )
  }
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
  useOnMachineReset(
    useCallback(() => {
      useLogs.setState({ urls: {} })
    }, [])
  )

  const updateLog = useLogs(useCallback((state) => state.set, []))
  const send = useMachineSend()
  const isCurrent = useMachineSelector(
    useCallback((state) => state.value === 'verifyingCredentials', [])
  )
  const ids = useIdsList()
  const verifiedCredentials = useVerifiedCredentials()
  const documentLoader = useCallback(
    async (url: string) => {
      unstable_batchedUpdates(() => {
        updateLog(url, 'loading')
      })
      try {
        const { default: documentLoader } = await import(
          '../lib/documentLoader'
        )
        const result = await documentLoader(url)

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
