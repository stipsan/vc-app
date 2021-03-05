import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useStore } from '../lib/useStore'
import ReportRow from './ReportRow'
import { Code, ErrorMessage } from './Formatted'

export default function FetchVerifiableCredentials() {
  const auth = useStore((state) => state.auth)
  const url = useStore((state) => state.url)
  const loading = useStore((state) => state.loading)
  const setLoading = useStore((state) => state.setLoading)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading) {
      return
    }

    let cancelled = false

    fetch(`/api/cors?url=${url}`, { headers: { Authorization: auth } })
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text())
        const data = await response.json()
        console.log({ data, cancelled })
        setLoading(false)
      })
      .catch((reason) => {
        toast.error(`Failed to load Verifiable Credentials`)
        setError(reason)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [loading, url, auth, loading])

  if (error) {
    return (
      <ReportRow readyState="error">
        Failed to load Verifiable Credentials from <Code>{url}</Code> with
        error: <ErrorMessage>{error}</ErrorMessage>
      </ReportRow>
    )
  }

  if (loading) {
    return (
      <ReportRow readyState={error ? 'error' : loading ? 'loading' : 'success'}>
        Loading Verifiable Credentials from API...
      </ReportRow>
    )
  }

  return null
}
