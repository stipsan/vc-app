import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useStore } from '../lib/useStore'
import ReportRow from './ReportRow'
import { Panel, ErrorMessage, ReadonlyTextarea } from './Formatted'

export default function FetchVerifiableCredentials() {
  const auth = useStore((state) => state.auth)
  const url = useStore((state) => state.url)
  const items = useStore((state) => state.items)
  const loading = useStore((state) => state.loading)
  const setLoading = useStore((state) => state.setLoading)
  const setItems = useStore((state) => state.setItems)
  const [error, setError] = useState('')
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    if (!loading) {
      return
    }

    setError('')
    setFetched(false)

    let cancelled = false

    fetch(`/api/cors?url=${url}`, {
      credentials: 'omit',
      headers: { Authorization: auth },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text())
        const data = await response.json()
        if (cancelled) return

        const items = []
          .concat(data?.items || data)
          .concat(data?.items || data)
          .concat(data?.items || data)

        if (!items.length) {
          throw new Error(
            `Failed to find Verifiable Credentials in the API response: ${JSON.stringify(
              data
            )}`
          )
        }

        setItems(items)
        setFetched(true)
      })
      .catch((reason) => {
        toast.error(`Failed fetching Verifiable Credentials`)
        setError(reason)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [loading, url, auth])

  if (error) {
    return (
      <ReportRow readyState="error">
        <Panel className="text-red-900 bg-red-50">
          <ErrorMessage>{error}</ErrorMessage>
        </Panel>
      </ReportRow>
    )
  }

  if (fetched) {
    return (
      <ReportRow readyState="success">
        <Panel className="text-green-900 bg-green-50">
          Found <strong className="font-bold">{items.length}</strong>
          {items.length === 1
            ? ' Verifiable Credential'
            : ' Verifiable Credentials'}
        </Panel>
        {items.map((item, i) => (
          <ReadonlyTextarea
            key={`item-${i}`}
            value={JSON.stringify(item, null, 2)}
          />
        ))}
      </ReportRow>
    )
  }

  if (loading) {
    return (
      <ReportRow readyState="loading">
        <Panel>Loading Verifiable Credentials from API...</Panel>
      </ReportRow>
    )
  }

  return null
}
