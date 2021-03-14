import { ReactJason } from 'react-jason'
import type { JasonTheme } from 'react-jason'
import { vscodeLight, vscodeDark } from 'react-jason/themes/index'
import type { CSSProperties } from 'react'

console.log({ vscodeLight, vscodeDark })

export const sharedRoot: CSSProperties = {
  fontFamily: 'Menlo, Monaco, "Courier New", monospace',
  fontFeatureSettings: '"liga" 0, "calt" 0',
  lineHeight: '1.5em',
  whiteSpace: 'pre',
  margin: 0,
}

const dark = {
  styles: {
    root: Object.assign({}, sharedRoot, { backgroundColor: '#212121' }),
    attribute: { color: '#a5e1ff' },
    unquotedAttribute: { color: '#d9d9d9' },
    string: { color: '#d49a81' },
    nil: { color: '#5da8dd' },
    number: { color: '#bed4b0' },
    boolean: { color: '#5da8dd' },
    punctuation: { color: '#d9d9d9' },
  },
}

const light = {
  styles: {
    root: Object.assign({}, sharedRoot, { backgroundColor: '#fff' }),
    attribute: { color: '#005db1' },
    unquotedAttribute: { color: '#000' },
    string: { color: '#ad0b04' },
    nil: { color: '#141aff' },
    number: { color: '#019162' },
    boolean: { color: '#141aff' },
    punctuation: { color: '#000' },
  },
}

/**
 * export type TokenType =
  | 'array'
  | 'attribute'
  | 'attributePair'
  | 'boolean'
  | 'nil'
  | 'number'
  | 'object'
  | 'punctuation'
  | 'quotation'
  | 'root'
  | 'string'
  | 'unquotedAttribute'

export type NodeType =
  | 'array'
  | 'attributePair'
  | 'boolean'
  | 'nil'
  | 'number'
  | 'object'
  | 'string'
 */

const twJasonTHeme: JasonTheme = {
  classes: {
    root: 'font-mono m-0 overflow-x-auto rounded-xl whitespace-pre',
  },
}

export default function Jason({
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
      value={value}
      sortKeys={sortKeys}
      quoteAttributes={quoteAttributes}
      theme={twJasonTHeme}
    />
  )
}
