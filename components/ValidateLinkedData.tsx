import * as jsonldChecker from 'jsonld-checker'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useStore } from '../lib/useStore'
import ReportRow from './ReportRow'
import {
  Panel,
  ErrorMessage,
  ReadonlyTextarea,
  SuperReadonlyTextarea,
} from './Formatted'
import cx from 'classnames'
import documentLoader from '../lib/documentLoader'
import jsonld from 'jsonld'

export default function ValidateLinkedData() {
  const items = useStore((state) => state.items)
  const jsonChecks = useStore((state) => state.jsonChecks)
  const loading = useStore((state) => state.loading)
  const setLoading = useStore((state) => state.setLoading)
  const setJsonChecks = useStore((state) => state.setJsonChecks)

  useEffect(() => {
    if (!loading || !items.length) {
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
          if (!result.ok) {
            throw result.error
          }
          if (cancelled) return
          // throw new Error('oooh')
          setJsonChecks({
            [i]: {
              readyState: 'success',
              expanded: await jsonld.expand(item, { documentLoader }),
              error: null,
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

  const results = Object.values(jsonChecks)

  useEffect(() => {
    if (
      loading &&
      results.length > 0 &&
      results.every(
        // @ts-expect-error
        (check) => check.readyState === 'error'
      )
    ) {
      toast.error(`Failed JSON-LD validation`)
      setLoading(false)
    }
  }, [jsonChecks, loading])

  if (!results.length) {
    return null
  }

  return (
    <ReportRow>
      {results.map(({ readyState, error, expanded }, i) => (
        <Panel
          key={`report-${i}`}
          className={cx({
            'bg-blue-50 text-black text-opacity-80 animate-pulse':
              readyState === 'loading',
            'text-red-900 bg-red-50': readyState === 'error',
            'text-green-900 bg-green-50': readyState === 'success',
          })}
        >
          {results.length > 1 ? `#${i + 1} ` : ''}
          {readyState === 'loading'
            ? 'Checking JSON-LD...'
            : readyState === 'error'
            ? 'Invalid JSON-LD'
            : 'Valid JSON-LD'}
          {readyState === 'success' && expanded && (
            <SuperReadonlyTextarea value={JSON.stringify(expanded, null, 2)} />
          )}
          {readyState === 'error' && error && (
            <div className="rounded py-2 my-1 px-3 bg-red-100">{`${error}: ${JSON.stringify(
              error
            )}`}</div>
          )}
        </Panel>
      ))}
    </ReportRow>
  )
}
