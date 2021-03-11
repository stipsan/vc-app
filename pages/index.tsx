import { useMachine } from '@xstate/react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import cx from 'classnames'
import { Toaster } from 'react-hot-toast'
import Header from '../components/Header'
import defaultMachine from '../lib/stateMachine'
import React from 'react'
import ReportRow from '../components/ReportRow'
import { Panel } from '../components/Formatted'

let retries = 0

const Strategy = dynamic(() => import('../components/Strategy'), {
  ssr: false,
  // @ts-expect-error
  timeout: 10000,
  loading: ({ error, isLoading, pastDelay, retry, timedOut }) => {
    const dots = (
      <>
        <div className="animate-pulse bg-gray-100 dark:bg-gray-800 py-1 rounded-full w-16">
          &nbsp;
        </div>
        <div
          className="animate-pulse bg-gray-50 dark:bg-gray-800 dark:bg-opacity-50 mx-3 my-1 rounded text-gray-900 w-10"
          style={{ animationDelay: '250ms' }}
        >
          &nbsp;
        </div>
        <div
          className="animate-pulse bg-gray-50 dark:bg-gray-800 dark:bg-opacity-50 mx-3 my-1 rounded text-gray-900 w-10"
          style={{ animationDelay: '500ms' }}
        >
          &nbsp;
        </div>
      </>
    )
    const tClassName =
      'px-6 pt-8 flex flex-initial items-center transition-opacity duration-150'
    const bClassName =
      'mx-6 mt-4 rounded-lg py-2 px-3 transition-colors duration-150'
    switch (true) {
      case !!error:
      case timedOut:
        return (
          <>
            <div className={cx(tClassName, 'opacity-0')}>{dots}</div>
            <div
              className={cx(
                bClassName,
                'text-red-900 dark:text-red-500 bg-red-50 dark:bg-opacity-20 dark:bg-red-900'
              )}
            >
              {error?.message || 'Loading failed'}
              {'! '}
              <button
                className="focus:outline-none focus:underline font-semibold hover:underline"
                type="button"
                onClick={retry}
              >
                Retry?
              </button>
            </div>
          </>
        )

      case isLoading:
        return (
          <>
            <div className={tClassName}>{dots}</div>
            <div
              className={cx(
                bClassName,
                'bg-gray-50 dark:bg-gray-800 text-black dark:text-white text-opacity-80 animate-pulse'
              )}
              style={{ animationDelay: '250ms' }}
            >
              Loading...
            </div>
          </>
        )
      default:
        return null
    }
  },
})

let retried = typeof window !== 'undefined'
const LazyBunch = dynamic(
  () =>
    import('../components/LazyBunch').then(
      (res) =>
        new Promise((resolve, reject) => {
          if (retries > 1) setTimeout(() => resolve(res), 3000)
          if (retries === 1)
            setTimeout(() => reject(new Error('Unexpected Error')), 3000)
          retries++
        })
    ),
  {
    ssr: false,
    // @ts-expect-error
    timeout: 10000,
    loading: ({ error, isLoading, pastDelay, retry, timedOut }) => {
      console.log({ retries, error, isLoading, pastDelay, timedOut })
      /*
className={cx('px-6 mb-4 grid gap-4', {
          'animate-pulse': readyState === 'loading',
        })}
        className = 'bg-blue-50 dark:bg-gray-800 text-black dark:text-white text-opacity-80',
        rounded-lg py-2 px-3
      */
      const loading = (
        <ReportRow readyState="loading">
          <Panel>Loading Verifiable Credentials from API...</Panel>
        </ReportRow>
      )
      switch (true) {
        case !!error:
        case timedOut:
          return (
            <>
              <div
                className="mx-6 mt-4 bg-gray-50 dark:bg-gray-800 text-black dark:text-white text-opacity-80 animate-pulse rounded-lg py-2 px-3"
                style={{ animationDelay: '250ms' }}
              >
                {error?.message || 'Loading failed'}
                {'! '}
                <button
                  className="focus:outline-none focus:underline font-semibold hover:underline"
                  type="button"
                  onClick={() => {
                    retried = true
                    retry()
                  }}
                >
                  Retry?
                </button>
              </div>
            </>
          )

        case isLoading:
          return (
            <>
              <div
                className="mx-6 mt-4 bg-gray-50 dark:bg-gray-800 text-black dark:text-white text-opacity-80 animate-pulse rounded-lg py-2 px-3"
                style={{ animationDelay: '250ms' }}
              >
                {JSON.stringify({ pastDelay: pastDelay || retried })} Loading
                verifiers...
              </div>
            </>
          )
        default:
          return null
      }
    },
  }
)

export default function Index() {
  // send and service are stable and return the same reference on every render, while state changes all the time
  // TODO: use xstate hooks on `service` to cut down on unnecessary rerenders
  const [state, send, service] = useMachine(defaultMachine)

  return (
    <>
      <Head>
        <title>Verifiable Credentials Verifier</title>
      </Head>
      <form
        className="min-h-screen"
        onSubmit={(event) => {
          event.preventDefault()

          send({ type: 'EXEC', input: '' })
        }}
      >
        <Strategy state={state} send={send} />
        <Header state={state} />
        <LazyBunch
          // @ts-ignore
          state={state}
          send={send}
        />
      </form>
      <footer className="bg-gray-50 dark:bg-gray-800 dark:bg-opacity-50 py-10 px-6 grid place-items-center">
        <a
          className="text-lg font-semibold"
          href="https://github.com/stipsan/vc-app"
        >
          GitHub
        </a>
      </footer>
      <Toaster position="bottom-center" />
    </>
  )
}
