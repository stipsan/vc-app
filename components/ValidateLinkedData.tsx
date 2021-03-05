import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useStore } from '../lib/useStore'
import ReportRow from './ReportRow'
import { Panel, ErrorMessage, ReadonlyTextarea } from './Formatted'
import cx from 'classnames'

export default function ValidateLinkedData() {
  const items = useStore((state) => state.items)
  const jsonLDs = useStore((state) => state.jsonLDs)
  const loading = useStore((state) => state.loading)
  const setLoading = useStore((state) => state.setLoading)
  const setJsonLDS = useStore((state) => state.setJsonLDS)

  useEffect(() => {
    if (!loading || !items.length) {
      return
    }

    let cancelled = false
    setJsonLDS(items.map((item) => ({ readyState: 'loading', input: item })))

    return () => {
      cancelled = true
    }
  }, [loading, items])

  if (!jsonLDs.length) {
    return null
  }

  return (
    <ReportRow>
      {jsonLDs.map((jsonLD, i) => (
        <Panel
          key={`report-${i}`}
          className={cx({
            'bg-blue-50 text-black text-opacity-80 animate-pulse':
              jsonLD.readyState === 'loading',
            'text-red-900 bg-red-50': jsonLD.readyState === 'error',
          })}
        >
          #{i + 1} Testing {jsonLD.readyState}
        </Panel>
      ))}
    </ReportRow>
  )
}
