import cx from 'classnames'
import { useEffect, useState } from 'react'
import type { Interpreter } from '../lib/stateMachine'
import { Panel, SuperReadonlyTextarea } from './Formatted'
import ReportRow from './ReportRow'

function ValidateLinkedDataRow({
  id,
  state,
  send,
}: {
  id: string
  state: Interpreter['state']
  send: Interpreter['send']
}) {
  const { ids, json } = state.context
  const [readyState, setReadyState] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [expanded, setExpanded] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      import('jsonld'),
      import('jsonld-checker'),
      import('../lib/documentLoader'),
    ])
      .then(
        async ([
          { default: jsonld },
          jsonldChecker,
          { default: documentLoader },
        ]) => {
          if (cancelled) return
          const result = await jsonldChecker.check(json.get(id), documentLoader)

          if (!result.ok) {
            throw result.error
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
        }
      )
      .catch((err) => {
        if (cancelled) return
        setReadyState('error')
        setError(err)
        send({ type: 'LINKING_DATA_FAILURE', input: id })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Panel
      className={cx({
        'bg-blue-50 dark:bg-gray-800 text-black dark:text-white text-opacity-80 animate-pulse':
          readyState === 'loading',
        'text-red-900 dark:text-red-500 bg-red-50 dark:bg-opacity-20 dark:bg-red-900':
          readyState === 'error',
        'text-green-900 dark:text-green-500 bg-green-50 dark:bg-opacity-25 dark:bg-green-900':
          readyState === 'success',
      })}
    >
      {ids.length > 1 ? `${id} ` : ''}
      {readyState === 'loading'
        ? 'Checking JSON-LD...'
        : readyState === 'error'
        ? 'Invalid JSON-LD'
        : 'Valid JSON-LD'}
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

export default function ValidateLinkedData({
  state,
  send,
}: {
  state: Interpreter['state']
  send: Interpreter['send']
}) {
  const { ids, jsonld } = state.context
  const isCurrent = state.matches('linkingData')

  useEffect(() => {
    if (isCurrent && jsonld.size === ids.length) {
      send({ type: 'LINKING_DATA_COMPLETE', input: '' })
    }
  }, [isCurrent, jsonld.size, ids.length])

  if (isCurrent || jsonld.size) {
    return (
      <ReportRow>
        {ids.map((id) => (
          <ValidateLinkedDataRow key={id} id={id} send={send} state={state} />
        ))}
      </ReportRow>
    )
  }

  return null
}
