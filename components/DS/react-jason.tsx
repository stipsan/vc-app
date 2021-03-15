import { memo } from 'react'
import { ReactJason } from 'react-jason'
import type { JasonTheme } from 'react-jason'

// TODO consider https://mac-s-g.github.io/react-json-view/demo/dist/ mode

const twJasonTHeme: JasonTheme = {
  classes: {
    root: 'font-mono m-0 overflow-x-auto rounded-xl whitespace-pre',
    attribute: 'text-blue-700 dark:text-blue-300',
    unquotedAttribute: 'opacity-80 text-black dark:text-gray-100',
    string: 'text-red-700 dark:text-red-300',
    nil: 'text-blue-700 dark:text-blue-300',
    number: 'text-green-700 dark:text-green-300',
    boolean: 'text-blue-700 dark:text-blue-300',
    punctuation: 'opacity-80 text-black dark:text-gray-100',
  },
}

export default memo(function CustomReactJason({
  value,
  quoteAttributes = true,
  sortKeys = false,
}: {
  value: unknown
  quoteAttributes?: boolean
  sortKeys?: boolean
}) {
  return (
    <ReactJason
      value={
        value instanceof Error
          ? { name: value.name, message: value.message, stack: value.stack }
          : value
      }
      sortKeys={sortKeys}
      quoteAttributes={quoteAttributes}
      theme={twJasonTHeme}
    />
  )
})
