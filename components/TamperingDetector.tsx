import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useStore } from '../lib/useStore'
import ReportRow from './ReportRow'
import { Panel, ErrorMessage, SuperReadonlyTextarea } from './Formatted'
import cx from 'classnames'
import documentLoader from '../lib/documentLoader'
import { ld as vc } from '@transmute/vc.js'
import { Ed25519Signature2018 } from '@transmute/ed25519-signature-2018'

export default function TamperingDetector() {
  const items = useStore((state) => state.items)
  const success = useStore((state) => state.success)
  const verifyChecks = useStore((state) => state.verifyChecks)
  const tamperings = useStore((state) => state.tamperings)
  const loading = useStore((state) => state.loading)
  const setLoading = useStore((state) => state.setLoading)
  const setSuccess = useStore((state) => state.setSuccess)
  const setTamperings = useStore((state) => state.setTamperings)

  useEffect(() => {
    const verifyChecksArr = Object.values(verifyChecks)
    if (
      !loading ||
      verifyChecksArr.length === 0 ||
      !verifyChecksArr.some(
        // @ts-expect-error
        (check) => check.readyState === 'success'
      )
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

    setTamperings(defaults)
    Promise.allSettled(
      items.map(async (item, i) => {
        if (verifyChecks[i].readyState === 'skip') {
          console.debug('Skipping verification on ', { [i]: item })
          setTamperings({
            [i]: {
              readyState: 'doubleskip',
              error: null,
            },
          })
          return
        }
        if (verifyChecks[i].readyState === 'error') {
          console.debug('Skipping verification on ', { [i]: item })
          setTamperings({
            [i]: {
              readyState: 'skip',
              error: null,
            },
          })
          return
        }
        try {
          const clone = JSON.parse(JSON.stringify(item))
          clone.credentialSubject.id = new Date()
          const result = await vc.verifyCredential({
            credential: clone,
            documentLoader,
            suite: new Ed25519Signature2018({}),
          })

          console.debug(
            'vc.verifyCredential result for',
            { i, item },
            'after editing credentialSubject.id',
            result
          )
          if (cancelled) return
          setTamperings({
            [i]: {
              readyState: result.verified ? 'failure' : 'success',
              error: result.error,
              expanded: result.results,
            },
          })
        } catch (err) {
          if (cancelled) return
          setTamperings({ [i]: { readyState: 'error', error: err } })
          console.error(i, item, err)
        }
      })
    )

    return () => {
      cancelled = true
    }
  }, [loading, items, verifyChecks])

  const total = Object.keys(tamperings).length

  useEffect(() => {
    if (
      !success &&
      loading &&
      total > 0 &&
      Object.values(tamperings).every(
        (check) =>
          // @ts-expect-error
          check.readyState !== 'loading'
      )
    ) {
      setLoading(false)
    }

    if (
      !success &&
      total > 0 &&
      Object.values(tamperings).every(
        (check) =>
          // @ts-expect-error
          check.readyState === 'success'
      )
    ) {
      setSuccess(true)
      toast.success('Verification successful!')
    }
  }, [tamperings, loading, success])

  if (!total) {
    return null
  }

  return (
    <ReportRow>
      {Object.values(tamperings).map(({ readyState, error, expanded }, i) => (
        <Panel
          key={`report-${i}`}
          className={cx({
            'bg-blue-50 text-black text-opacity-80':
              readyState === 'loading' ||
              readyState === 'skip' ||
              readyState === 'doubleskip',
            'animate-pulse': readyState === 'loading',
            'text-red-900 bg-red-50':
              readyState === 'error' || readyState === 'failure',
            'text-green-900 bg-green-50': readyState === 'success',
          })}
        >
          {total > 1 ? `#${i + 1} ` : ''}
          {readyState === 'loading'
            ? 'Attempting to tamper with credentialSubject and fool the signature check...'
            : readyState === 'doubleskip'
            ? `Skipped tampering detection because of the JSON-LD validation failing`
            : readyState === 'skip'
            ? `Skipped tampering detection because of the failed verification`
            : readyState === 'error'
            ? `Unexpected error`
            : readyState === 'failure'
            ? `Able to tamper with credentialSubject without failing the signature check`
            : 'Tampering with credentialSubject successfully detected by the signature check'}
          {readyState === 'success' && error && (
            <SuperReadonlyTextarea value={JSON.stringify(error, null, 2)} />
          )}
          {readyState === 'failure' && expanded && (
            <SuperReadonlyTextarea
              className="bg-red-100 focus:ring-inset focus:ring-red-200 focus:ring-2"
              value={JSON.stringify(expanded, null, 2)}
            />
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
