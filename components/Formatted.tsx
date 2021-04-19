import cx from 'classnames'
import React, { useCallback, useState } from 'react'

export function Code({ children }: { children: React.ReactNode }) {
  return <code>{children}</code>
}

export function Collapsible({
  children,
  className = 'bg-gray-100 dark:bg-gray-700',
}: {
  children: React.ReactNode
  className?: string
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
        <div
          className={cx('overflow-hidden rounded py-2 my-1 px-3', className)}
        >
          {children}
        </div>
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
  variant?: 'default' | 'error' | 'blank'
}) {
  return (
    <div
      className={cx(
        'rounded-lg py-2 px-3',
        {
          'bg-gray-50 dark:bg-gray-800 text-black dark:text-white text-opacity-80':
            variant === 'default',
          'bg-red-50 dark:bg-opacity-20 dark:bg-red-900 text-red-900 dark:text-red-500 break-words':
            variant === 'error',
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
