import cx from 'classnames'
import { useLayoutEffect, useRef, useState } from 'react'

export function Code({ children }: { children: React.ReactNode }) {
  return <code>{children}</code>
}

export function ReadonlyTextarea({ children }: { children: React.ReactNode }) {
  const ref = useRef()
  const [height, setHeight] = useState(0)

  useLayoutEffect(() => {
    // @ts-expect-error
    setHeight(ref.current.scrollHeight)
  }, [])

  return (
    <textarea
      ref={ref}
      readOnly
      style={{ height: height ? `${height}px` : undefined, maxHeight: '9vh' }}
      className="bg-blue-50 text-black text-opacity-80 rounded-lg py-2 px-3 border-0"
    >
      {children}
    </textarea>
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
