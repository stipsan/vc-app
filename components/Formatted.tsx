import React from 'react'

export function Code({ children }: { children: React.ReactNode }) {
  return <code>{children}</code>
}

export function ErrorMessage({ children }: { children: Error | string }) {
  return <pre>{`${children}`}</pre>
}
