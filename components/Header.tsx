import cx from 'classnames'
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import type { Interpreter } from '../lib/stateMachine'

function SubmitButton(props: { state: Interpreter['state'] }) {
  const loading = !['ready', 'success', 'failure'].some(props.state.matches)

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
      <span className="absolute left-0 top-0 right-0 bottom-0 flex items-center justify-center">
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

export default function Header({
  send,
  state,
}: {
  send: Interpreter['send']
  state: Interpreter['state']
}) {
  const loading = [
    'fetching',
    'linkingData',
    'verifyingCredentials',
    'counterfeitingCredentials',
  ].some(state.matches)
  const failure = state.matches('failure')
  const success = state.matches('success')
  const titleRef = useRef('')
  const { status } = state.context

  useEffect(() => {
    if (loading) {
      titleRef.current = document.title
      document.title = 'Verifying Credentials...'
      const toastId = toast.loading('Verifying...')
      return () => {
        toast.dismiss(toastId)
        document.title = titleRef.current
      }
    }
  }, [loading])

  const message = status
    ? status
    : loading
    ? 'Verifying...'
    : failure
    ? 'Verification failed!'
    : ''

  return (
    <>
      <header
        className={cx('sticky -top-2 -bottom-2 px-6 py-4 z-10')}
        style={{
          ['--tw-gradient-stops' as string]: 'hsla(0,0%,100%,0), white 1.5rem, white 50%, hsla(0,0%,100%,0) 50%',
          backgroundImage:
            'linear-gradient(to top, var(--tw-gradient-stops)), linear-gradient(to bottom, var(--tw-gradient-stops))',
        }}
      >
        <div
          className={cx(
            'grid gap-x-2 grid-cols-1 md:grid-rows-1 md:grid-cols-header',
            { 'grid-rows-2': message }
          )}
        >
          <SubmitButton state={state} />
          {message && (
            <span
              className={cx('self-center', {
                'text-gray-800': !failure && !success,
                'text-red-800': failure,
                'text-green-800': success,
              })}
            >
              {message}
            </span>
          )}
        </div>
      </header>
      <div className="sticky bottom-0 top-0 h-6 -mt-6 bg-white" />
    </>
  )
}
