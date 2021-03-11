import cx from 'classnames'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export function Code({ children }: { children: React.ReactNode }) {
  return <code>{children}</code>
}

export function ReadonlyTextarea({
  className = 'bg-blue-50 dark:bg-gray-800 text-black dark:text-white text-opacity-80 rounded-lg py-2 px-3 border-0 focus:ring-inset focus:ring-blue-200 dark:focus:ring-blue-800 focus:ring-2',
  value,
}: {
  className?: string
  value: string
}) {
  const ref = useRef<HTMLTextAreaElement>()
  const [height, setHeight] = useState(0)
  const [formatted, setFormatted] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([
      import('prettier/parser-babel'),
      import('prettier/standalone'),
    ]).then(([{ default: babelParser }, { default: prettier }]) => {
      if (cancelled) return

      setFormatted(
        prettier
          .format(value, {
            printWidth: 100,
            tabWidth: 4,
            parser: 'json',
            plugins: [babelParser],
          })
          .trim()
      )
    })

    return () => {
      cancelled = true
    }
  }, [value])

  useLayoutEffect(() => {
    if (ref.current) {
      setHeight(ref.current.scrollHeight)
    }
  }, [formatted])

  if (!formatted) {
    return <div className={cx(className, 'animate-pulse')}>Formatting...</div>
  }

  return (
    <textarea
      ref={ref}
      readOnly
      style={{ height: height ? `${height}px` : undefined }}
      className={className}
      value={formatted}
    ></textarea>
  )
}
//text-green-900 dark:text-green-500 bg-green-50 dark:bg-opacity-25 dark:bg-green-900
export function SuperReadonlyTextarea({
  className = 'bg-green-100 dark:bg-opacity-25 dark:bg-green-900 focus:ring-inset focus:ring-green-200 dark:focus:ring-green-900 focus:ring-2',
  value,
}: {
  className?: string
  value: string
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <button
        className="float-right focus:outline-none focus:underline font-bold hover:underline text-sm block mt-0.5"
        type="button"
        onClick={() => setExpanded((expanded) => !expanded)}
      >
        {expanded ? 'Collapse' : 'Expand'}
      </button>
      {expanded && (
        <ReadonlyTextarea
          className={cx(
            className,
            'rounded my-1 py-2 px-3 border-0 block w-full'
          )}
          value={value}
        />
      )}
    </>
  )
}

export function ErrorMessage({ children }: { children: Error | string }) {
  return <pre className="break-all whitespace-normal">{`${children}`}</pre>
}

export function Panel({
  children,
  className = 'bg-blue-50 dark:bg-gray-800 text-black dark:text-white text-opacity-80',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cx(className, 'rounded-lg py-2 px-3')}>{children}</div>
}
