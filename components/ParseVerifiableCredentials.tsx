import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import type { Interpreter } from '../lib/stateMachine'
import { useStore } from '../lib/useStore'
import { ErrorMessage, Panel, ReadonlyTextarea } from './Formatted'
import ReportRow from './ReportRow'

export default function ParseVerifiableCredentials(props: {
  state: Interpreter['state']
  send: Interpreter['send']
}) {
  const { send, state } = props
  const { ids, json } = state.context
  const parsing = state.matches('parsing')
  const editor = useStore((state) => state.editor)
  const [error, setError] = useState('')
  const [lastUsedStrategy, setLastUsedStrategy] = useState(false)

  useEffect(() => {
    if (state.matches('fetching') || state.matches('demoing')) {
      setLastUsedStrategy(false)
    }
  }, [state])

  useEffect(() => {
    if (!parsing) {
      return
    }

    setLastUsedStrategy(true)
    setError('')

    try {
      const data = JSON.parse(editor)
      const items = [].concat(data?.items || data)

      if (!items.length) {
        throw new Error(`Failed to find Verifiable Credentials in the editor`)
      }

      send({ type: 'PARSE_SUCCESS', input: items })
    } catch (err) {
      send({
        type: 'PARSE_FAILURE',
        input: `Couldn't find Verifiable Credentials in the editor`,
      })
      toast.error(`Failed finding Verifiable Credentials in the editor`)
      setError(err)
    }
  }, [parsing, editor])

  if (!lastUsedStrategy && !state.matches('parsing')) {
    return null
  }

  if (error) {
    return (
      <ReportRow readyState="error">
        <Panel className="text-red-900 bg-red-50">
          <ErrorMessage>{error}</ErrorMessage>
        </Panel>
      </ReportRow>
    )
  }

  if (ids.length) {
    return (
      <ReportRow readyState="success">
        <Panel className="text-green-900 bg-green-50">
          Found <strong className="font-bold">{ids.length}</strong>
          {ids.length === 1
            ? ' Verifiable Credential'
            : ' Verifiable Credentials'}
        </Panel>
        {ids.map((id) => (
          <ReadonlyTextarea
            key={id}
            value={JSON.stringify(json.get(id), null, 2)}
          />
        ))}
      </ReportRow>
    )
  }

  if (state.matches('parsing')) {
    return (
      <ReportRow readyState="loading">
        <Panel>Parsing Verifiable Credentials from editor...</Panel>
      </ReportRow>
    )
  }

  return null
}
