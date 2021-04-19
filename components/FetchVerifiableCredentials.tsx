import { useEffect, useState } from 'react'
import { useMachineSend, useMachineState } from '../lib/contexts'
import { useStore } from '../lib/useStore'
import ReactJason from './DS/react-jason'
import { ErrorMessage, Panel } from './Formatted'
import ReportRow from './ReportRow'

export default function FetchVerifiableCredentials() {
  const send = useMachineSend()
  const state = useMachineState()
  const { ids, json } = state.context
  const fetching = state.matches('fetching')
  const auth = useStore((state) => state.auth)
  const url = useStore((state) => state.url)
  const [error, setError] = useState('')
  const [lastUsedStrategy, setLastUsedStrategy] = useState(false)

  useEffect(() => {
    if (state.value === 'parsing' || state.value === 'demoing') {
      setLastUsedStrategy(false)
    }
  }, [state.value])

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

        const items = [].concat(
          data?.verifiableCredential || data?.items || data
        )

        if (!items.length) {
          throw new Error(
            `Failed to find Verifiable Credentials in the API response: ${JSON.stringify(
              data
            )}`
          )
        }

        send({
          type: 'FETCH_SUCCESS',
          input: items
            .map((item) => {
              if ('verifiableCredential' in item)
                return item.verifiableCredential
              return item
            })
            .filter((item) => item.type?.includes('VerifiableCredential')),
        })
      })
      .catch((reason) => {
        send({ type: 'FETCH_FAILURE', input: `${reason}` })
        setError(reason)
      })

    return () => {
      cancelled = true
    }
  }, [fetching, url, auth, send])

  switch (true) {
    case !lastUsedStrategy && !state.matches('fetching'):
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
          <Panel>
            Found <span className="font-bold">{ids.length}</span>
            {ids.length === 1
              ? ' Verifiable Credential'
              : ' Verifiable Credentials'}
          </Panel>
          {ids.map((id) => (
            <Panel
              key={id}
              className="w-[calc(100vw-2rem)] md:w-[calc(100vw-3rem)]"
            >
              <ReactJason value={json.get(id)} />
            </Panel>
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
