import cx from 'classnames'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useImmer } from 'use-immer'
import type { DocumentLoader, LogsMap } from '../lib/documentLoader'
import { createDocumentLoaderWithLogs } from '../lib/documentLoader'
import type { Interpreter } from '../lib/stateMachine'
import DocumentLoaderLogs from './DocumentLoaderLogs'
import { Panel, SuperReadonlyTextarea } from './Formatted'
import ReportRow from './ReportRow'

function ValidateLinkedDataRow({
  id,
  state,
  send,
  documentLoader,
}: {
  id: string
  state: Interpreter['state']
  send: Interpreter['send']
  documentLoader: DocumentLoader
}) {
  const { ids, json } = state.context
  const [readyState, setReadyState] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [expanded, setExpanded] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([import('jsonld'), import('jsonld-checker')])
      .then(async ([{ default: jsonld }, jsonldChecker]) => {
        if (cancelled) return

        const result = await jsonldChecker.check(
          JSON.parse(JSON.stringify(json.get(id))),
          documentLoader
        )

        if (!result.ok) {
          const error = new Error(result.error.details)
          error.name = result.error.type
          console.error(error)
          throw error
        }
        if (cancelled) return
        // throw new Error('oooh')
        const expanded = await jsonld.expand(
          JSON.parse(JSON.stringify(json.get(id))),
          // @ts-expect-error
          { documentLoader }
        )
        if (cancelled) return
        setReadyState('success')
        setExpanded(expanded)
        send({ type: 'LINKING_DATA_SUCCESS', input: id })
      })
      .catch((err) => {
        if (cancelled) return
        setReadyState('error')
        setError(err)
        toast.error(`${id} Invalid JSON-LD`)
        send({ type: 'LINKING_DATA_FAILURE', input: id })
      })

    return () => {
      cancelled = true
      console.warn('JSON-LD validation cancelled')
    }
  }, [])

  const message =
    readyState === 'loading'
      ? 'Checking JSON-LD...'
      : readyState === 'error'
      ? 'Invalid JSON-LD'
      : 'Valid JSON-LD'

  return (
    <Panel
      className={cx({ 'animate-pulse': readyState === 'loading' })}
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
        <div className="rounded py-2 my-1 px-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-20">
          {error.message}
          <br />
          {error.stack}
        </div>
      )}
    </Panel>
  )
}

export default function ValidateLinkedData({
  state,
  send,
}: {
  state: Interpreter['state']
  send: Interpreter['send']
}) {
  const { ids, jsonld } = state.context
  const isCurrent = state.matches('linkingData')
  const [log, updateLog] = useImmer<LogsMap>(new Map())
  const documentLoader = useMemo(
    () => createDocumentLoaderWithLogs(updateLog),
    []
  )
  console.log('ValidateLinkedData', { log })

  useEffect(() => {
    if (isCurrent && jsonld.size === ids.length) {
      send({ type: 'LINKING_DATA_COMPLETE', input: '' })
    }
  }, [isCurrent, jsonld.size, ids.length])

  if (isCurrent || jsonld.size) {
    return (
      <ReportRow>
        <DocumentLoaderLogs
          loading={isCurrent}
          log={log}
          updateLog={updateLog}
        />
        {ids.map((id) => (
          <ValidateLinkedDataRow
            key={id}
            id={id}
            send={send}
            state={state}
            documentLoader={documentLoader}
          />
        ))}
      </ReportRow>
    )
  }

  return null
}
