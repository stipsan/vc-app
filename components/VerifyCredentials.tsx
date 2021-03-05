import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useStore } from '../lib/useStore'
import ReportRow from './ReportRow'
import { Panel, ErrorMessage, SuperReadonlyTextarea } from './Formatted'
import cx from 'classnames'
import documentLoader from '../lib/documentLoader'
import { ld as vc } from '@transmute/vc.js'
import { Ed25519Signature2018 } from '@transmute/ed25519-signature-2018'

export default function ValidateLinkedData() {
  const items = useStore((state) => state.items)
  const jsonChecks = useStore((state) => state.jsonChecks)
  const verifyChecks = useStore((state) => state.verifyChecks)
  const loading = useStore((state) => state.loading)
  const setLoading = useStore((state) => state.setLoading)
  const setVerifyChecks = useStore((state) => state.setVerifyChecks)

  useEffect(() => {
    const jsonChecksArr = Object.values(jsonChecks)
    if (
      !loading ||
      jsonChecksArr.length === 0 ||
      // @ts-expect-error
      !jsonChecksArr.some((check) => check.readyState === 'success')
    ) {
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

    setVerifyChecks(defaults)
    Promise.allSettled(
      items.map(async (item, i) => {
        if (jsonChecks[i].readyState === 'error') {
          setVerifyChecks({
            [i]: {
              readyState: 'skip',
              error: null,
            },
          })
          return
        }
        try {
          const result = await vc.verifyCredential({
            credential: item,
            documentLoader,
            suite: new Ed25519Signature2018({}),
          })
          // throw new Error('oooh')
          if (cancelled) return
          setVerifyChecks({
            [i]: {
              readyState: result.verified ? 'success' : 'error',
              error: result.error,
              expanded: result.results,
            },
          })
        } catch (err) {
          if (cancelled) return
          setVerifyChecks({ [i]: { readyState: 'error', error: err } })
          console.error(i, item, err)
        }
      })
    )

    return () => {
      cancelled = true
    }
  }, [loading, items, jsonChecks])

  const results = Object.values(verifyChecks)
  const total = Object.keys(verifyChecks).length

  useEffect(() => {
    if (
      loading &&
      results.length > 0 &&
      results.every(
        // @ts-expect-error
        (check) => check.readyState === 'error' || check.readyState === 'skip'
      )
    ) {
      toast.error(`Failed verification`)
      setLoading(false)
    }
  }, [verifyChecks, loading])

  if (!total) {
    return null
  }

  return (
    <ReportRow>
      {results.map(({ readyState, error, expanded }, i) => (
        <Panel
          key={`report-${i}`}
          className={cx({
            'bg-blue-50 text-black text-opacity-80':
              readyState === 'loading' || readyState === 'skip',
            'animate-pulse': readyState === 'loading',
            'text-red-900 bg-red-50': readyState === 'error',
            'text-green-900 bg-green-50': readyState === 'success',
          })}
        >
          {total > 1 ? `#${i + 1} ` : ''}
          {readyState === 'loading'
            ? 'Verifying Credential...'
            : readyState === 'skip'
            ? `Skipping verification because of invalid JSON-LD`
            : readyState === 'error'
            ? `Failed verification`
            : 'Credential verified successfully'}
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
