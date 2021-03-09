import cx from 'classnames'

export default function ReportRow({
  children,
  readyState = 'pending',
}: {
  children: React.ReactNode
  readyState?: 'pending' | 'loading' | 'error' | 'success'
}) {
  return (
    <>
      <hr
        className={cx(
          'mx-6 mb-4 border-t-2 border-blue-800 dark:border-blue-200 opacity-5'
        )}
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
