import { useMachine } from '@xstate/react'
import cx from 'classnames'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { Panel } from '../components/Formatted'
import Header from '../components/Header'
import HorisontalRuler from '../components/HorizontalRuler'
import defaultMachine from '../lib/stateMachine'
import Strategy from '../components/Strategy.Lazy'

// When React Suspense is stable we'll no longer need to specify both a Suspense boundary fallback
// and a dynamic.loading. The single Suspense fallback will be enough

let retried = false
const LazyBunch = dynamic(() => import('../components/LazyBunch'), {
  ssr: false,
  // @ts-expect-error
  delay: 3000,
  timeout: 10000,
  loading: ({ error, isLoading, pastDelay, retry, timedOut }) => {
    const className = 'mx-6 mt-4 transition-colors'
    switch (true) {
      case !!error:
      case timedOut:
        return (
          <div className="transition-opacity">
            <HorisontalRuler />
            <Panel className={className} variant="error">
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
              {error?.stack && (
                <>
                  <br />
                  {error.stack}
                </>
              )}
            </Panel>
          </div>
        )

      case isLoading:
        return (
          <div
            className={cx('transition-opacity', {
              'opacity-0': !pastDelay && !retried,
            })}
          >
            <HorisontalRuler />
            <Panel
              className={cx(
                className,
                'animate-pulse bg-gray-50 dark:bg-gray-800 text-black dark:text-white text-opacity-80'
              )}
              variant="blank"
            >
              {(pastDelay || retried) && 'Loading...'}
            </Panel>
          </div>
        )
      default:
        return null
    }
  },
})

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
        <LazyBunch state={state} send={send} />
      </form>
      <footer className="bg-gray-50 dark:bg-gray-800 dark:bg-opacity-50 py-10 px-6 grid place-items-center">
        <a
          className="text-lg font-semibold"
          href="https://github.com/stipsan/vc-app"
        >
          GitHub
        </a>
      </footer>
      <Toaster position="top-right" />
    </>
  )
}
