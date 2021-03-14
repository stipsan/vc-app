import cx from 'classnames'
import dynamic from 'next/dynamic'
import { Panel } from './Formatted'

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

export function StrategyLazy({
  error,
  isLoading,
  retry,
  timedOut,
}: {
  error?: Error
  isLoading: boolean
  retry?: () => void
  timedOut?: boolean
}) {
  const tClassName =
    'px-4 md:px-6 pt-8 flex flex-initial items-center transition-opacity'
  const bClassName = 'mx-4 md:mx-6 mt-4 transition-colors'
  switch (true) {
    case !!error:
    case timedOut:
      return (
        <>
          <div className={cx(tClassName, 'opacity-0')}>{dots}</div>
          <Panel className={bClassName} variant="error">
            {error?.message || 'Loading failed'}
            {'! '}
            <button
              className="focus:outline-none focus:underline font-semibold hover:underline"
              type="button"
              onClick={retry}
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
        </>
      )

    case isLoading:
      return (
        <>
          <div className={tClassName}>{dots}</div>
          <Panel
            className={cx(
              bClassName,
              'bg-gray-50 dark:bg-gray-800 text-black dark:text-white text-opacity-80 animate-pulse'
            )}
            style={{ animationDelay: '250ms' }}
            variant="blank"
          >
            Loading...
          </Panel>
        </>
      )
    default:
      return null
  }
}

export default dynamic(() => import('./Strategy'), {
  ssr: false,
  // @ts-expect-error
  timeout: 10000,
  loading: ({ error, isLoading, retry, timedOut }) => (
    <StrategyLazy
      error={error}
      isLoading={isLoading}
      retry={retry}
      timedOut={timedOut}
    />
  ),
})
