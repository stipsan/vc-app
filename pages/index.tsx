import cx from 'classnames'
import type { GetStaticProps } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import resolveConfig from 'tailwindcss/resolveConfig'
import ExecForm from '../components/ExecForm'
import { Panel } from '../components/Formatted'
import Header, { StatusMessage } from '../components/Header'
import HorisontalRuler from '../components/HorizontalRuler'
import Strategy from '../components/Strategy.Lazy'
import { MachineProvider } from '../lib/contexts'
import { useTheme } from '../lib/utils'
import tailwindConfig from '../tailwind.config.js'

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
    const className = 'mx-4 md:mx-6 mt-4 motion-safe:transition-colors'
    switch (true) {
      case !!error:
      case timedOut:
        return (
          <div className="motion-safe:transition-opacity">
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
              {!process.env.STORYBOOK && error?.stack && (
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
            className={cx('motion-safe:transition-opacity', {
              'opacity-0': !pastDelay && !retried,
            })}
          >
            <HorisontalRuler />
            <Panel
              className={cx(
                className,
                'motion-safe:animate-pulse bg-gray-50 dark:bg-gray-800 text-black dark:text-white text-opacity-80'
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

const ScrollTo = dynamic(() => import('../components/ScrollTo'), { ssr: false })

export default function Index({ theme }) {
  useTheme(theme)
  return (
    <>
      <Head>
        <title>Verifiable Credentials Verifier</title>
      </Head>
      <MachineProvider>
        <ExecForm>
          <Strategy />
          <Header />
          <LazyBunch />
        </ExecForm>
        <StatusMessage className="md:hidden pointer-events-none bg-gradient-to-t block bottom-0 -mt-4 pb-4 pt-10 px-7 sticky z-40 from-white dark:from-gray-900 via-white dark:via-gray-900" />
        <ScrollTo />
      </MachineProvider>
      <footer className="bg-gradient-to-t from-gray-200 dark:from-gray-800 py-10 px-4 md:px-6 grid place-items-center opacity-50 motion-safe:transition-opacity hover:opacity-100 active:opacity-100 focus-within:opacity-100">
        <a
          className="text-lg font-semibold"
          href="https://github.com/stipsan/vc-app"
        >
          GitHub
        </a>
      </footer>
    </>
  )
}
