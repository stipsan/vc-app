import cx from 'classnames'
import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/useStore'

function SyncHistoryState() {
  const auth = useStore((state) => state.auth)

  useEffect(() => {
    localStorage.setItem('vcv.auth', auth)
  }, [auth])

  return null
}

function UrlField() {
  const setUrl = useStore((state) => state.setUrl)
  const url = useStore((state) => state.url)
  const loading = useStore((state) => state.loading)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const searchParams = new URLSearchParams(location.search)
    if (searchParams.has('url')) {
      try {
        const defaultUrl = new URL(searchParams.get('url'))
        console.log(searchParams.get('url'))
        setUrl(defaultUrl.toString())
      } catch {
        // we ignore any URL parser errors
      }
    }
  }, [])

  return (
    <label
      className={cx('block transition-opacity duration-150', {
        'opacity-30 pointer-events-none': loading,
      })}
    >
      <span className="text-gray-700">API URL</span>
      <input
        className={cx(
          'mt-1 h-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
        )}
        type="url"
        onChange={(event) => setUrl(event.target.value)}
        value={url}
        readOnly={!mounted || loading}
        required
      />
    </label>
  )
}

function AuthField() {
  const setAuth = useStore((state) => state.setAuth)
  const auth = useStore((state) => state.auth)
  const loading = useStore((state) => state.loading)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (localStorage.getItem('vcv.auth')) {
      try {
        setAuth(localStorage.getItem('vcv.auth'))
      } catch {
        // we ignore any URL parser errors
      }
    }
  }, [])

  return (
    <label
      className={cx('block transition-opacity duration-150', {
        'opacity-30 pointer-events-none': loading,
      })}
    >
      <span className="text-gray-700">Authorization</span>
      <input
        className={cx(
          'mt-1 h-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
        )}
        type="text"
        onChange={(event) => setAuth(event.target.value)}
        value={auth}
        readOnly={!mounted || loading}
        required
      />
    </label>
  )
}

function SubmitButton() {
  const loading = useStore((state) => state.loading)

  return (
    <button
      type="submit"
      className={cx(
        'relative focus:outline-none border border-transparent group flex items-center justify-center rounded-md bg-blue-100 text-base font-medium px-6 h-10 md:place-self-end',
        {
          'text-blue-200 bg-blue-200 cursor-wait': loading,
          'text-blue-600 hover:bg-blue-200 focus:bg-blue-200 hover:text-blue-800 focus:ring focus:ring-blue-100 focus:ring-opacity-50': !loading,
        }
      )}
    >
      <span className="absolute left-0 top-0 right-0 bottom-0 grid place-items-center">
        <svg
          className={cx(
            'animate-spin h-5 w-5 text-blue-800 duration-150 trasnition-opacity',
            { 'opacity-0': !loading, 'opacity-80': loading }
          )}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </span>
      Verify
    </button>
  )
}

// https://api.stage.proxy.com/identity/me/credentials/
// Bearer eyJhbGciOiJIUzI1NiJ9.eyJhenAiOiJjZjA5ODk5YWQ4OWM0N2M3ZGMzZWQ5MmRlYjAwODExNDZkYzQ2ZmM3Iiwic3ViIjoiMTI4ODVlZTctMWQxZi00MzQ1LWExMGItZGI1NDA0OGE1OWNmIiwic2lkIjoiOTY2ZTU0ZmYtMjhkMS00M2NmLThjMTAtNDkxOTM5NzU4OTQ3IiwiZXhwIjoxNjE0OTY2Nzk3LCJpYXQiOjE2MTQ4ODAzOTd9.gTGxMUgrAf2XRvo3U1X2bUR92aDZ0JUx7iXxyaxLqxo

export default function Header() {
  const setLoading = useStore((state) => state.setLoading)
  const loading = useStore((state) => state.loading)
  const titleRef = useRef('')

  useEffect(() => {
    if (loading) {
      titleRef.current = document.title
      document.title = 'Verifying Credentials...'
      return () => {
        document.title = titleRef.current
      }
    }
  }, [loading])

  return (
    <>
      <header
        className={cx('sticky top-0 px-6 py-2 bg-gradient-to-t z-10', {
          'cursor-wait': loading,
        })}
        style={{
          ['--tw-gradient-stops' as string]: 'hsla(0,0%,100%,0), white 1.5rem',
        }}
      >
        <form
          title={loading ? 'Verifying...' : undefined}
          className={cx('grid gap-4 md:grid-cols-header', {
            'select-none bg-gradient-to-t rounded-md': loading,
          })}
          style={{
            ['--tw-gradient-stops' as string]: 'hsla(0,0%,100%,0), white .1rem',
          }}
          onSubmit={(event) => {
            event.preventDefault()

            if (loading) {
              return
            }

            setLoading(true)
          }}
        >
          <UrlField />
          <AuthField />
          <SubmitButton />
        </form>
      </header>
      <SyncHistoryState />
    </>
  )
}
