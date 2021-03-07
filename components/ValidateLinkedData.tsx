import cx from 'classnames'
import jsonld from 'jsonld'
import * as jsonldChecker from 'jsonld-checker'
import { useEffect, useState } from 'react'
import documentLoader from '../lib/documentLoader'
import type { Interpreter } from '../lib/stateMachine'
import { Panel, SuperReadonlyTextarea } from './Formatted'
import ReportRow from './ReportRow'

function ValidateLinkedDataRow(props: {
  id: string
  state: Interpreter['state']
  send: Interpreter['send']
}) {
  const { id, send } = props
  const { items, json } = props.state.context
  const [readyState, setReadyState] = useState('loading')
  const [expanded, setExpanded] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    setExpanded(null)
    setReadyState('loading')

    jsonldChecker
      .check(json.get(id), documentLoader)
      .then(async (result) => {
        if (!result.ok) {
          throw result.error
        }
        if (cancelled) return
        // throw new Error('oooh')
        const expanded = await jsonld.expand(json.get(id), {
          documentLoader,
        })
        if (cancelled) return
        setReadyState('success')
        setExpanded(expanded)
        send({ type: 'LINKING_DATA_SUCCESS', input: id })
      })
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
        'bg-blue-50 text-black text-opacity-80 animate-pulse':
          readyState === 'loading',
        'text-red-900 bg-red-50': readyState === 'error',
        'text-green-900 bg-green-50': readyState === 'success',
      })}
    >
      {items.length > 1 ? `${id} ` : ''}
      {readyState === 'loading'
        ? 'Checking JSON-LD...'
        : readyState === 'error'
        ? 'Invalid JSON-LD'
        : 'Valid JSON-LD'}
      {readyState === 'success' && expanded && (
        <SuperReadonlyTextarea value={JSON.stringify(expanded, null, 2)} />
      )}
      {readyState === 'error' && error && (
        <div className="rounded py-2 my-1 px-3 bg-red-100">{`${error}: ${JSON.stringify(
          error
        )}`}</div>
      )}
    </Panel>
  )
}

export default function ValidateLinkedData(props: {
  state: Interpreter['state']
  send: Interpreter['send']
}) {
  const { state, send } = props
  const { items } = state.context

  useEffect(() => {
    if (
      state.matches('linkingData') &&
      state.context.jsonld.size === items.length
    ) {
      send({ type: 'LINKING_DATA_COMPLETE', input: '' })
    }
  }, [state, items])

  if (state.matches('linkingData') || state.context.jsonld.size) {
    return (
      <ReportRow>
        {items.map((id) => (
          <ValidateLinkedDataRow key={id} id={id} send={send} state={state} />
        ))}
      </ReportRow>
    )
  }

  return null
}
