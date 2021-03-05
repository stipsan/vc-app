import cx from 'classnames'
import { useLayoutEffect, useRef } from 'react'
import scrollIntoView from 'smooth-scroll-into-view-if-needed'

export default function ReportRow({
  children,
  readyState = 'pending',
}: {
  children: React.ReactNode
  readyState?: 'pending' | 'loading' | 'error' | 'success'
}) {
  const domRef = useRef()

  useLayoutEffect(() => {
    if (domRef.current) {
      scrollIntoView(domRef.current, { behavior: 'smooth', block: 'start' })
    }
  }, [])

  return (
    <>
      <hr
        ref={domRef}
        className={cx('mx-6 mb-4 border-t-2 border-blue-800 opacity-5')}
      />
      <article
        className={cx('px-6 mb-4 grid gap-4', {
          'animate-pulse': readyState === 'loading',
        })}
      >
        {children}
      </article>
    </>
  )
}
