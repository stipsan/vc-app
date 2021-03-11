import cx from 'classnames'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import type { Interpreter } from '../lib/stateMachine'

function SubmitButton(props: { state: Interpreter['state'] }) {
  const [mounted, setMounted] = useState(false)
  const [mountedComplete, setMountedComplete] = useState(false)
  useEffect(() => {
    setMounted(true)
    setTimeout(() => setMountedComplete(true), 150)
  }, [])

  const loading = !['ready', 'success', 'failure'].some(props.state.matches)

  return (
    <button
      type={mounted ? 'submit' : 'button'}
      className={cx(
        'relative focus:outline-none border border-transparent group flex items-center justify-center rounded-md text-base font-medium px-6 h-10 md:place-self-end focus-visible:bg-blue-200 dark:focus-visible:bg-blue-800 focus-visible:ring focus-visible:ring-blue-100 dark:focus-visible:ring-blue-900 focus-visible:ring-opacity-50',
        {
          'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 cursor-wait': loading,
          'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 hover:text-blue-800 dark:hover:text-blue-200 active:bg-blue-300 dark:active:bg-blue-700': !loading,
          'opacity-0 cursor-default': !mounted,
        },
        mounted && mountedComplete ? 'transition-colors' : 'transition-opacity'
      )}
    >
      <span
        key="spinner"
        className="absolute left-0 top-0 right-0 bottom-0 flex items-center justify-center"
      >
        <svg
          className={cx('animate-spin h-5 w-5 transition-opacity', {
            'opacity-0': !loading,
            'opacity-80': loading,
          })}
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
      <span
        key="label"
        className={cx('transition-opacity', {
          'opacity-0': loading,
          'opacity-100': !loading,
        })}
      >
        Verify
      </span>
    </button>
  )
}

export default function Header({ state }: { state: Interpreter['state'] }) {
  const loading = [
    'fetching',
    'linkingData',
    'verifyingCredentials',
    'counterfeitingCredentials',
  ].some(state.matches)
  const failure = state.matches('failure')
  const success = state.matches('success')
  const titleRef = useRef(typeof window !== 'undefined' ? document.title : '')
  const { status } = state.context

  useEffect(() => {
    if (!failure && !success && status) {
      document.title = status
      return () => {
        document.title = titleRef.current
      }
    }
  }, [failure, success, status])

  useEffect(() => {
    if (success) {
      let timeout = new Promise((resolve) =>
        setTimeout(() => resolve(undefined), 3000)
      )
      const toastId = toast.success(status, { duration: 10000 })
      return () => {
        timeout.then(() => toast.dismiss(toastId))
      }
    }
  }, [success])

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
        className={cx(
          'sticky -top-2 -bottom-2 px-6 py-4 z-10 bg-gradient-to-t-to-b from-white dark:from-gray-900'
        )}
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
                'text-gray-800 dark:text-gray-400': !failure && !success,
                'text-red-800 dark:text-red-400': failure,
                'text-green-800 dark:text-green-400': success,
              })}
            >
              {message}
            </span>
          )}
        </div>
      </header>
      <div className="sticky bottom-0 top-0 h-6 -mt-6 bg-white dark:bg-gray-900" />
    </>
  )
}
