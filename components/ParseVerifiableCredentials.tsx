import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useMachineSend, useMachineState } from '../lib/contexts'
import { useStore } from '../lib/useStore'
import { ErrorMessage, Panel, ReadonlyTextarea } from './Formatted'
import ReportRow from './ReportRow'

export default function ParseVerifiableCredentials() {
  const send = useMachineSend()
  const state = useMachineState()
  const { ids, json } = state.context
  const parsing = state.matches('parsing')
  const editor = useStore((state) => state.editor)
  const [error, setError] = useState('')
  const [lastUsedStrategy, setLastUsedStrategy] = useState(false)

  useEffect(() => {
    if (state.value === 'fetching' || state.value === 'demoing') {
      setLastUsedStrategy(false)
    }
  }, [state.value])

  useEffect(() => {
    if (!parsing) {
      return
    }

    setLastUsedStrategy(true)
    setError('')

    try {
      const data = JSON.parse(editor)
      const items = [].concat(data?.verifiableCredential || data?.items || data)

      if (!items.length) {
        throw new Error(`Failed to find Verifiable Credentials in the editor`)
      }

      send({
        type: 'PARSE_SUCCESS',
        input: items.map((item) => {
          if ('verifiableCredential' in item) return item.verifiableCredential
          return item
        }),
      })
    } catch (err) {
      send({
        type: 'PARSE_FAILURE',
        input: `Couldn't find Verifiable Credentials in the editor`,
      })
      toast.error(`Failed finding Verifiable Credentials in the editor`)
      setError(err)
    }
  }, [parsing, editor, send])

  switch (true) {
    case !lastUsedStrategy && !state.matches('parsing'):
      return null

    case !!error:
      return (
        <ReportRow readyState="error">
          <Panel variant="error">
            <ErrorMessage>{error}</ErrorMessage>
          </Panel>
        </ReportRow>
      )

    case ids.length > 0:
      return (
        <ReportRow readyState="success">
          <Panel variant="success">
            Found <span className="font-bold">{ids.length}</span>
            {ids.length === 1
              ? ' Verifiable Credential'
              : ' Verifiable Credentials'}
          </Panel>
          {ids.map((id) => (
            <ReadonlyTextarea key={id} value={JSON.stringify(json.get(id))} />
          ))}
        </ReportRow>
      )

    case state.matches('parsing'):
      return (
        <ReportRow readyState="loading">
          <Panel>Parsing Verifiable Credentials from editor...</Panel>
        </ReportRow>
      )

    default:
      return null
  }
}
