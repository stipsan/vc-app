import cx from 'classnames'
import { useMemo, useState } from 'react'
import { LogsState } from '../lib/utils'
import { Panel, ReadonlyTextarea, useListFormat } from './Formatted'

function LogRow({
  url,
  value,
}: {
  url: string
  value: 'loading' | Error | object
}) {
  const [view, setView] = useState(false)
  const urlClamped = (
    <span className="line-clamp-2 break-all flex-auto">{url}</span>
  )
  if (value === 'loading') {
    return (
      <div
        className={cx('rounded-sm', {
          'bg-blue-50 dark:bg-gray-800 text-black dark:text-white text-opacity-80 animate-pulse': true,
        })}
      >
        <div className={cx('px-3 py-2 flex break-words items-center')}>
          <svg
            className={cx('animate-spin inline-block h-5 w-5 mr-2.5 flex-none')}
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
          {urlClamped}
        </div>
      </div>
    )
  }

  if (value instanceof Error) {
    return (
      <div
        className={cx('rounded-sm', {
          'text-red-900 dark:text-red-500 bg-red-50 dark:bg-opacity-20 dark:bg-red-900': true,
        })}
      >
        <div className={cx('px-3 py-2 flex break-words items-center')}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="inline-block fill-current h-5 w-5  mr-2.5 flex-none"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M3.404 12.596a6.5 6.5 0 119.192-9.192 6.5 6.5 0 01-9.192 9.192zM2.344 2.343a8 8 0 1011.313 11.314A8 8 0 002.343 2.343zM6.03 4.97a.75.75 0 00-1.06 1.06L6.94 8 4.97 9.97a.75.75 0 101.06 1.06L8 9.06l1.97 1.97a.75.75 0 101.06-1.06L9.06 8l1.97-1.97a.75.75 0 10-1.06-1.06L8 6.94 6.03 4.97z"
            ></path>
          </svg>
          {urlClamped}
          <button
            className="flex-none ml-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase focus:outline-none transition-opacity opacity-70 hover:opacity-100 focus-visible:opacity-100 bg-red-900 dark:bg-red-500 text-white dark:text-gray-900"
            type="button"
            onClick={() => setView((view) => !view)}
          >
            {view ? 'Hide' : 'Error'}
          </button>
        </div>
        {view && (
          <div className="rounded-sm mx-1 mb-1 py-2 px-2 break-all bg-red-100 dark:bg-red-900 dark:bg-opacity-20">
            {url}
            <br />
            {value.message}
            <br />
            {value.stack}
          </div>
        )}
      </div>
    )
  }

  return (
    <section
      className={cx('rounded-sm', {
        'text-green-900 dark:text-green-500 bg-green-200 bg-opacity-20 dark:bg-opacity-25 dark:bg-green-900': true,
      })}
    >
      <div className="sticky top-16 md:top-10 h-9 md:h-7 -mb-9 md:-mb-7 rounded-sm bg-white dark:bg-gray-900 z-20  pointer-events-none" />
      <div
        className={cx(
          'px-3 py-2 flex break-words items-center sticky top-24 md:top-16 z-30 rounded-sm bg-green-50 dark:bg-green-900'
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="inline-block fill-current h-5 w-5 mr-2.5 flex-none"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM0 8a8 8 0 1116 0A8 8 0 010 8zm11.78-1.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z"
          ></path>
        </svg>
        <span className={cx('break-all flex-auto line-clamp-2')}>{url}</span>
        <button
          className="flex-none ml-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase focus:outline-none transition-opacity opacity-70 hover:opacity-100 focus-visible:opacity-100 bg-green-900 dark:bg-green-500 text-green-50 dark:text-green-900"
          type="button"
          onClick={(event) => {
            const target = event.currentTarget
            setView((view) => !view)
            requestAnimationFrame(
              () =>
                view &&
                target.closest('section')?.scrollIntoView({ block: 'nearest' })
            )
          }}
        >
          {view ? 'Hide' : 'View'}
        </button>
      </div>
      {view && (
        <div className="mx-1">
          <ReadonlyTextarea
            className="bg-green-100 dark:bg-opacity-25 dark:bg-green-900 focus:ring-green-200 dark:focus:ring-green-900 focus:ring-2 rounded-sm mb-1 py-2 px-2 border-0 block w-full"
            value={JSON.stringify(value)}
          />
        </div>
      )}
    </section>
  )
}

export default function DocumentLoaderLogs({
  loading,
  log,
  updateLog,
}: {
  loading?: boolean
  log: LogsState['urls']
  updateLog: LogsState['set']
}) {
  const [expanded, setExpanded] = useState(false)
  const logs = useMemo(() => Object.entries(log), [log])
  const loadingTotal = logs.reduce(
    (total, [, current]) => (current === 'loading' ? ++total : total),
    0
  )
  const errorTotal = logs.reduce(
    (total, [, current]) => (current instanceof Error ? ++total : total),
    0
  )
  const successTotal = logs.length - loadingTotal - errorTotal
  const summaries = useListFormat([
    successTotal > 0 && (
      <span key="success">
        resolved{' '}
        <span className="font-black text-green-900 dark:text-green-500">
          {successTotal}
        </span>{' '}
        external
        {successTotal === 1 ? ' reference ' : ' references '}
      </span>
    ),
    loadingTotal > 0 && (
      <span key="loading" className="">
        is resolving{' '}
        <span className="font-black animate-pulse">{loadingTotal}</span>
        {successTotal === 0 &&
          (loadingTotal === 1
            ? ' external reference '
            : ' external references ')}
      </span>
    ),
    errorTotal > 0 && (
      <span key="failed">
        failed{' '}
        <span className="text-red-900 dark:text-red-500 font-black">
          {errorTotal}
        </span>
        {successTotal === 0 &&
          loadingTotal === 0 &&
          (errorTotal === 1 ? ' external reference ' : ' external references ')}
      </span>
    ),
  ])

  if (!loading && logs.length === 0) {
    return null
  }

  console.log({ summaries })
  return (
    <Panel>
      {logs.length > 0 ? (
        <>The document loader {summaries} </>
      ) : (
        'The document loader is standby'
      )}
      <button
        className="float-right focus:outline-none focus:underline font-bold hover:underline text-sm block mt-0.5"
        type="button"
        onClick={() => setExpanded((expanded) => !expanded)}
      >
        {expanded ? 'Collapse' : 'Expand'}
      </button>
      {expanded && (
        <div className="gap-y-1 grid p-1 mt-2 -mx-1.5 -mb-0.5 bg-white dark:bg-gray-900 rounded clear-both">
          {logs.map(([url, value]) => (
            <LogRow key={url} url={url} value={value} />
          ))}
        </div>
      )}
    </Panel>
  )
}
