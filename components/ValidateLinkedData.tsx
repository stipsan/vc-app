import * as jsonldChecker from 'jsonld-checker'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useStore } from '../lib/useStore'
import ReportRow from './ReportRow'
import { Panel, ErrorMessage, ReadonlyTextarea } from './Formatted'
import cx from 'classnames'
import documentLoader from '../lib/documentLoader'

export default function ValidateLinkedData() {
  const items = useStore((state) => state.items)
  const jsonChecks = useStore((state) => state.jsonChecks)
  const loading = useStore((state) => state.loading)
  const setLoading = useStore((state) => state.setLoading)
  const setJsonChecks = useStore((state) => state.setJsonChecks)

  useEffect(() => {
    if (!loading) {
      return
    }

    let cancelled = false
    const defaults = items.reduce(
      (acc, _, key) => ({
        ...acc,
        [key]: { readyState: 'loading', error: null },
      }),
      {}
    )

    setJsonChecks(defaults)
    Promise.allSettled(
      items.map(async (item, i) => {
        console.log(item, i)
        try {
          const result = await jsonldChecker.check(item, documentLoader)
          console.log(i, item, result)
          if (cancelled) return
          setJsonChecks({
            [i]: {
              readyState: result.ok ? 'success' : 'error',
              error: result.error,
            },
          })
        } catch (err) {
          if (cancelled) return
          setJsonChecks({ [i]: { readyState: 'error', error: err } })
          console.error(i, item, err)
        }
      })
    )

    return () => {
      cancelled = true
    }
  }, [loading, items])

  const total = Object.keys(jsonChecks).length

  useEffect(() => {
    if (
      loading &&
      total > 0 &&
      // @ts-expect-error
      Object.values(jsonChecks).every((check) => check.readyState === 'error')
    ) {
      setLoading(false)
    }
  }, [jsonChecks, loading])

  if (!total) {
    return null
  }

  return (
    <ReportRow>
      {Object.values(jsonChecks).map(({ readyState, error }, i) => (
        <Panel
          key={`report-${i}`}
          className={cx({
            'bg-blue-50 text-black text-opacity-80 animate-pulse':
              readyState === 'loading',
            'text-red-900 bg-red-50': readyState === 'error',
            'text-green-900 bg-green-50': readyState === 'success',
          })}
        >
          {total > 1 ? `#${i + 1} ` : ''}
          {readyState === 'loading'
            ? 'Checking JSON-LD...'
            : readyState === 'error'
            ? 'Invalid JSON-LD'
            : 'Valid JSON-LD'}
          {readyState === 'error' && error && (
            <div className="rounded py-2 my-1 px-3 bg-red-100">{`${JSON.stringify(
              error
            )}`}</div>
          )}
        </Panel>
      ))}
    </ReportRow>
  )
}
