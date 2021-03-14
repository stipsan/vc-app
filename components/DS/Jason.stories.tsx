import ReactJason from './react-jason'
import { useReducer, useState } from 'react'
import cx from 'classnames'

import verifiableCredentials from '../../fixtures.json'

function Example({ exploded, value }: { exploded?: boolean; value: unknown }) {
  const [quoteAttributes, setQuoteAttributes] = useReducer(
    (prev) => !prev,
    true
  )
  const variants = ['normal', 'failure', 'success']
  const [sortKeys, setSortKeys] = useReducer((prev) => !prev, false)
  const [variant, setVariant] = useState('normal')

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {!exploded && (
        <label className="inline-flex items-center">
          Variant
          <select
            className="ml-2"
            value={variant}
            onChange={(event) => setVariant(event.target.value)}
          >
            {variants.map((variant) => (
              <option key={variant}>{variant}</option>
            ))}
          </select>
        </label>
      )}
      <label className="inline-flex items-center">
        Quote properties
        <input
          className="ml-2"
          type="checkbox"
          onChange={setQuoteAttributes}
          checked={quoteAttributes}
        />
      </label>

      <label
        className={cx('inline-flex items-center', {
          'md:col-span-2': exploded,
        })}
      >
        Sort keys
        <input
          className="ml-2"
          type="checkbox"
          onChange={setSortKeys}
          checked={sortKeys}
        />
      </label>
      {(exploded ? variants : [variant]).map((variant) => (
        <div
          key={variant}
          className={cx(exploded ? 'col-span-1' : 'col-span-4 md:col-span-6')}
        >
          {[].concat(value).map((value, i) => (
            <div
              key={i}
              className={cx('rounded-lg py-2 px-3', {
                'bg-blue-50 dark:bg-gray-800 text-black dark:text-white text-opacity-80':
                  variant === 'normal',
                'text-red-900 dark:text-red-500 bg-red-50 dark:bg-opacity-20 dark:bg-red-900':
                  variant === 'failure',
                'text-green-900 dark:text-green-500 bg-green-50 dark:bg-opacity-25 dark:bg-green-900':
                  variant === 'success',
              })}
            >
              #{i + 1} Heading
              <div
                className={cx('overflow-hidden rounded py-2 my-1 px-3', {
                  'bg-blue-100 dark:bg-gray-700': variant === 'normal',
                  'bg-red-100 dark:bg-red-900 dark:bg-opacity-20':
                    variant === 'failure',
                  'bg-green-100 dark:bg-opacity-25 dark:bg-green-900':
                    variant === 'success',
                })}
              >
                <ReactJason
                  value={value}
                  quoteAttributes={quoteAttributes}
                  sortKeys={sortKeys}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export const VerifiableCredentials = () => (
  <Example value={verifiableCredentials} />
)

export const Error = () => <Example value={new TypeError(`Uh oh huh`)} />

export const String = () => <Example value={`Hello World!`} />

export const JSON = () => (
  <Example
    exploded
    value={{
      string: 'Hello, GitHub',
      number: 123.45,
      boolean: true,
      null: null,
      array: ['one', 'two', 'three'],
      object: {
        nested: {
          fields: 'yes',
        },
      },
      keyedArray: [
        {
          _key: 'abc',
          _type: 'span',
          text: 'Coolio',
        },
        {
          _key: 'xyz',
          _type: 'span',
          text: 'Yes',
        },
      ],
    }}
  />
)

export default {
  title: 'Design System/Rich Formatting/react-jason',
}
