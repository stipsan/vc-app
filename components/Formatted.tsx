import cx from 'classnames'
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

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
      setHeight(ref.current.scrollHeight + 2)
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
  className,
  style,
  variant = 'default',
}: {
  children: React.ReactNode
  className?: string
  style?: any
  variant?: 'default' | 'error' | 'success' | 'blank'
}) {
  return (
    <div
      className={cx(
        'rounded-lg py-2 px-3',
        {
          'bg-blue-50 dark:bg-gray-800 text-black dark:text-white text-opacity-80':
            variant === 'default',
          'text-red-900 dark:text-red-500 bg-red-50 dark:bg-opacity-20 dark:bg-red-900 break-words':
            variant === 'error',
          'text-green-900 dark:text-green-500 bg-green-50 dark:bg-opacity-25 dark:bg-green-900':
            variant === 'success',
        },
        className
      )}
      style={style}
    >
      {children}
    </div>
  )
}

export function useListFormat(list: React.ReactNode[]) {
  const formatter = useCallback((list: React.ReactNode[]) => {
    if (list.length === 0) return null
    let cursor = 0
    return 'ListFormat' in Intl
      ? // @ts-expect-error
        new Intl.ListFormat('en', { type: 'conjunction' })
          .formatToParts(list.map((_, i) => `${i}`))
          .map((part) =>
            part.type === 'element' ? list[cursor++] : part.value
          )
      : list.reduce((accumulator, currentValue) => (
          <>
            {accumulator}, {currentValue}
          </>
        ))
  }, [])
  return <>{formatter(list.filter(Boolean))}</>
}
