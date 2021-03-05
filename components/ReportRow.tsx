import cx from 'classnames'

export default function ReportRow({
  children,
  readyState,
}: {
  children: React.ReactNode
  readyState?: 'pending' | 'loading' | 'error' | 'success'
}) {
  return (
    <>
      <hr className={cx('mx-6 border-t-2')} />
      <article
        className={cx('px-6 py-2', {
          'animate-pulse': readyState === 'pending' || readyState === 'loading',
        })}
      >
        {children}
      </article>
    </>
  )
}
