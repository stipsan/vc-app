import cx from 'classnames'
import babelParser from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'

export function Code({ children }: { children: React.ReactNode }) {
  return <code>{children}</code>
}

export function ReadonlyTextarea({
  className = 'bg-blue-50 text-black text-opacity-80 rounded-lg py-2 px-3 border-0 focus:ring-inset focus:ring-blue-200 focus:ring-2',
  value,
}: {
  className?: string
  value: string
}) {
  const ref = useRef()
  const [height, setHeight] = useState(0)

  const formatted = useMemo(
    () =>
      prettier
        .format(value, {
          printWidth: 100,
          tabWidth: 4,
          parser: 'json',
          plugins: [babelParser],
        })
        .trim(),
    [value]
  )

  useLayoutEffect(() => {
    // @ts-expect-error
    setHeight(ref.current.scrollHeight)
  }, [])

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
  className = 'bg-green-100 focus:ring-inset focus:ring-green-200 focus:ring-2',
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
  className = 'bg-blue-50 text-black text-opacity-80',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cx(className, 'rounded-lg py-2 px-3')}>{children}</div>
}
