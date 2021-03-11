import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import type { Interpreter } from '../lib/stateMachine'
import { useStore } from '../lib/useStore'
import { ErrorMessage, Panel, ReadonlyTextarea } from './Formatted'
import ReportRow from './ReportRow'

export default function FetchVerifiableCredentials(props: {
  state: Interpreter['state']
  send: Interpreter['send']
}) {
  const { send, state } = props
  const { ids, json } = state.context
  const fetching = state.matches('fetching')
  const auth = useStore((state) => state.auth)
  const url = useStore((state) => state.url)
  const [error, setError] = useState('')
  const [lastUsedStrategy, setLastUsedStrategy] = useState(false)

  useEffect(() => {
    if (state.matches('parsing') || state.matches('demoing')) {
      setLastUsedStrategy(false)
    }
  }, [state])

  useEffect(() => {
    if (!fetching) {
      return
    }

    setLastUsedStrategy(true)
    setError('')

    let cancelled = false

    fetch(`/api/cors?url=${url}`, {
      credentials: 'omit',
      headers: { Authorization: auth },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text())
        const data = await response.json()
        if (cancelled) return

        const items = [].concat(data?.items || data)

        if (!items.length) {
          throw new Error(
            `Failed to find Verifiable Credentials in the API response: ${JSON.stringify(
              data
            )}`
          )
        }

        send({
          type: 'FETCH_SUCCESS',
          input: items.map((item) => {
            if ('verifiableCredential' in item) return item.verifiableCredential
            return item
          }),
        })
      })
      .catch((reason) => {
        send({ type: 'FETCH_FAILURE', input: `${reason}` })
        toast.error(`Failed fetching Verifiable Credentials`)
        setError(reason)
      })

    return () => {
      cancelled = true
    }
  }, [fetching, url, auth])

  switch (true) {
    case !lastUsedStrategy && !state.matches('fetching'):
      return null

    case !!error:
      return (
        <ReportRow readyState="error">
          <Panel className="text-red-900 dark:text-red-500 bg-red-50 dark:bg-opacity-20 dark:bg-red-900">
            <ErrorMessage>{error}</ErrorMessage>
          </Panel>
        </ReportRow>
      )

    case ids.length > 0:
      return (
        <ReportRow readyState="success">
          <Panel className="text-green-900 dark:text-green-500 bg-green-50 dark:bg-opacity-25 dark:bg-green-900">
            Found <strong className="font-bold">{ids.length}</strong>
            {ids.length === 1
              ? ' Verifiable Credential'
              : ' Verifiable Credentials'}
          </Panel>
          {ids.map((id) => (
            <ReadonlyTextarea key={id} value={JSON.stringify(json.get(id))} />
          ))}
        </ReportRow>
      )

    case state.matches('fetching'):
      return (
        <ReportRow readyState="loading">
          <Panel>Loading Verifiable Credentials from API...</Panel>
        </ReportRow>
      )

    default:
      return null
  }
}
