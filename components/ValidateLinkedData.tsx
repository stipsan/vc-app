import produce from 'immer'
import { memo, Suspense, useCallback, useEffect } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { createAsset } from 'use-asset'
import create from 'zustand'
import {
  useMachineSelector,
  useMachineSend,
  useOnMachineReset,
} from '../lib/contexts'
import type { DocumentLoader } from '../lib/documentLoader'
import { useIdsList, useJsonld, useJsonMap } from '../lib/selectors'
import { LogsState } from '../lib/utils'
import DocumentLoaderLogs from './DocumentLoaderLogs'
import ReactJason from './DS/react-jason'
import { Collapsible, Panel } from './Formatted'
import ReportRow from './ReportRow'

const work = createAsset(
  async (documentLoader: DocumentLoader, json: object) => {
    try {
      const [{ default: jsonld }, jsonldChecker] = await Promise.all([
        import('jsonld'),
        import('jsonld-checker'),
      ])

      const result = await jsonldChecker.check(
        JSON.parse(JSON.stringify(json)),
        documentLoader
      )

      if (!result.ok) {
        const error = new Error(result.error.details)
        error.name = result.error.type
        if (process.env.STORYBOOK) {
          delete error.stack
        }
        console.error(error)
        throw error
      }

      const expanded = await jsonld.expand(
        JSON.parse(JSON.stringify(json)),
        // @ts-expect-error
        { documentLoader }
      )

      return {
        ok: true,
        data: expanded,
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

function ValidateLinkedDataRow({
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
      send({ type: 'LINKING_DATA_SUCCESS', input: id })
    }
    if (result.ok === false) {
      send({ type: 'LINKING_DATA_FAILURE', input: id })
    }
  }, [id, nu, result, send])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => work.clear(documentLoader, json), [])

  switch (result.ok) {
    case false:
      return (
        <Panel variant="error">
          {nu}
          Invalid JSON-LD
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
    case true:
      return (
        <Panel className="w-[calc(100vw-2rem)] md:w-[calc(100vw-3rem)]">
          {nu}
          Valid JSON-LD
          <Collapsible>
            <ReactJason value={result.data} />
          </Collapsible>
        </Panel>
      )
  }
}

const ValidateLinkedDataDocumentLoaderLogs = memo(
  ({ loading }: { loading: boolean }) => {
    const log = useLogs(useCallback((state) => state.urls, []))

    return <DocumentLoaderLogs loading={loading} log={log} />
  }
)

export default function ValidateLinkedData() {
  useOnMachineReset(
    useCallback(() => {
      useLogs.setState({ urls: {} })
    }, [])
  )

  const send = useMachineSend()
  const ids = useIdsList()
  const jsonld = useJsonld()
  const isCurrent = useMachineSelector(
    useCallback((state) => state.value === 'linkingData', [])
  )

  const updateLog = useLogs(useCallback((state) => state.set, []))
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
    if (isCurrent && jsonld.size === ids.length) {
      send({ type: 'LINKING_DATA_COMPLETE', input: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrent, jsonld.size, ids.length])

  if (isCurrent || jsonld.size) {
    return (
      <ReportRow>
        <ValidateLinkedDataDocumentLoaderLogs loading={isCurrent} />
        {ids.map((id, nu) => (
          <Suspense
            key={id}
            fallback={
              <Panel className="animate-pulse">
                #{nu + 1} Checking JSON-LD...
              </Panel>
            }
          >
            <ValidateLinkedDataRow
              id={id}
              nu={`#${nu + 1} `}
              documentLoader={documentLoader}
            />
          </Suspense>
        ))}
      </ReportRow>
    )
  }

  return null
}
