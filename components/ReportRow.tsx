import cx from 'classnames'
import HorizontalRuler from './HorizontalRuler'

export default function ReportRow({
  children,
  readyState = 'pending',
}: {
  children: React.ReactNode
  readyState?: 'pending' | 'loading' | 'error' | 'success'
}) {
  return (
    <>
      <HorizontalRuler />
      <article
        className={cx('px-4 md:px-6 mb-4 grid gap-4', {
          'animate-pulse': readyState === 'loading',
        })}
      >
        {children}
      </article>
    </>
  )
}
