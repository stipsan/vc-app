import cx from 'classnames'
import { useStore } from '../lib/useStore'

function UrlField() {
  const setUrl = useStore((state) => state.setUrl)
  const url = useStore((state) => state.url)
  const loading = useStore((state) => state.loading)

  return (
    <label
      className={cx('block transition-opacity', { 'opacity-30': loading })}
    >
      <span className="text-gray-700">API URL</span>
      <input
        className={cx(
          'mt-1 h-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
        )}
        type="url"
        onChange={(event) => setUrl(event.target.value)}
        value={url}
        readOnly={loading}
        required
      />
    </label>
  )
}

function AuthField() {
  const setAuth = useStore((state) => state.setAuth)
  const auth = useStore((state) => state.auth)
  const loading = useStore((state) => state.loading)

  return (
    <label
      className={cx('block transition-opacity', { 'opacity-30': loading })}
    >
      <span className="text-gray-700">Authorization</span>
      <input
        className={cx(
          'mt-1 h-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
        )}
        type="text"
        onChange={(event) => setAuth(event.target.value)}
        value={auth}
        readOnly={loading}
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
        'focus:outline-none border border-transparent hover:bg-blue-200 focus:bg-blue-200 hover:text-blue-800 group flex items-center rounded-md bg-blue-100 text-blue-600 text-base font-medium px-6 h-10 focus:ring focus:ring-blue-100 focus:ring-opacity-50 place-self-end'
      )}
    >
      Verify {loading ? 'loading' : ''}
    </button>
  )
}

// https://api.stage.proxy.com/identity/me/credentials/
// Bearer eyJhbGciOiJIUzI1NiJ9.eyJhenAiOiJjZjA5ODk5YWQ4OWM0N2M3ZGMzZWQ5MmRlYjAwODExNDZkYzQ2ZmM3Iiwic3ViIjoiMTI4ODVlZTctMWQxZi00MzQ1LWExMGItZGI1NDA0OGE1OWNmIiwic2lkIjoiOTY2ZTU0ZmYtMjhkMS00M2NmLThjMTAtNDkxOTM5NzU4OTQ3IiwiZXhwIjoxNjE0OTY2Nzk3LCJpYXQiOjE2MTQ4ODAzOTd9.gTGxMUgrAf2XRvo3U1X2bUR92aDZ0JUx7iXxyaxLqxo

export default function Header() {
  const setLoading = useStore((state) => state.setLoading)
  const loading = useStore((state) => state.loading)

  return (
    <header
      className={cx('sticky top-0 px-6 py-2 bg-gradient-to-t', {
        'cursor-wait': loading,
      })}
      style={{
        ['--tw-gradient-stops' as string]: 'hsla(0,0%,100%,0), white 1.5rem',
      }}
    >
      <form
        className={cx('grid gap-4 md:grid-cols-header', {
          'pointer-events-none select-none': loading,
        })}
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
  )
}
