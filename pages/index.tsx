import cx from 'classnames'
import type { GetStaticProps } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import resolveConfig from 'tailwindcss/resolveConfig'
import ExecForm from '../components/ExecForm'
import { Panel } from '../components/Formatted'
import Header from '../components/Header'
import HorisontalRuler from '../components/HorizontalRuler'
import Strategy from '../components/Strategy.Lazy'
import { DocumentLoaderProvider, MachineProvider } from '../lib/contexts'
import { useTheme } from '../lib/utils'
import tailwindConfig from '../tailwind.config.js'
console.log(tailwindConfig)
export const getStaticProps: GetStaticProps = async () => {
  // @ts-expect-error
  const { theme } = resolveConfig(tailwindConfig)
  return {
    props: { theme }, // will be passed to the page component as props
  }
}

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

export default function Index({ theme }) {
  const setTheme = useTheme((state) => state.set)
  useEffect(() => {
    setTheme(theme)
  }, [])
  return (
    <>
      <Head>
        <title>Verifiable Credentials Verifier</title>
      </Head>
      <DocumentLoaderProvider>
        <MachineProvider>
          <ExecForm>
            <Strategy />
            <Header />
            <LazyBunch />
          </ExecForm>
        </MachineProvider>
      </DocumentLoaderProvider>
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
