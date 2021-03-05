import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useStore } from '../lib/useStore'
import ReportRow from './ReportRow'
import { Panel, ErrorMessage, ReadonlyTextarea } from './Formatted'
import cx from 'classnames'

// using vc.js

export default function VerifyCredentials() {
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
        [key]: 'loading',
      }),
      {}
    )
    setJsonChecks(defaults)

    return () => {
      cancelled = true
    }
  }, [loading, items])

  if (!Object.keys(jsonChecks).length) {
    return null
  }

  return (
    <ReportRow>
      {Object.values(jsonChecks).map((readyState, i) => (
        <Panel
          key={`report-${i}`}
          className={cx({
            'bg-blue-50 text-black text-opacity-80 animate-pulse':
              readyState === 'loading',
            'text-red-900 bg-red-50': readyState === 'error',
          })}
        >
          #{i + 1}{' '}
          {readyState === 'loading'
            ? 'Checking JSON-LD...'
            : readyState === 'error'
            ? 'Invalid JSON-LD'
            : 'Valid JSON-LD'}
        </Panel>
      ))}
    </ReportRow>
  )
}
