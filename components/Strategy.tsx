import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useTabsContext,
} from '@reach/tabs'
import cx from 'classnames'
import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import Textarea from 'react-expanding-textarea'
import { useMachineSend, useMachineState } from '../lib/contexts'
import type { Interpreter } from '../lib/stateMachine'
import { useStore } from '../lib/useStore'

function StrategyPanel({ children }: { children: React.ReactNode }) {
  return (
    <TabPanel className="focus:outline-none bg-white dark:bg-gray-900 dark:bg-opacity-50 rounded-md focus-visible:ring focus-visible:ring-blue-200 dark:focus-visible:ring-blue-900 ring-offset-4 dark:ring-offset-gray-900">
      {children}
    </TabPanel>
  )
}

function DemoStrategy() {
  return (
    <StrategyPanel>
      <div className="rounded-lg py-2 px-3 bg-gray-50 dark:bg-gray-800">
        Create a few mock Verifiable Credentials to demonstrate the verification
        flow.
      </div>
    </StrategyPanel>
  )
}

function ParseStrategy() {
  const state = useMachineState()
  const setEditor = useStore((state) => state.setEditor)
  const editor = useStore((state) => state.editor)
  const editingRef = useRef(false)
  const { strategy } = state.context
  const loading = [
    'parsing',
    'linkingData',
    'verifyingCredentials',
    'counterfeitingCredentials',
  ].some(state.matches)

  return (
    <StrategyPanel>
      <Textarea
        spellCheck={false}
        placeholder="Paste your JSON in here..."
        className={cx(
          'mt-1 h-10 block dark:placeholder-gray-400 w-full rounded-md dark:bg-gray-900 border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-300 dark:focus:border-blue-600 focus:ring focus:ring-blue-200 dark:focus:ring-blue-900 ring-opacity-50 transition-opacity',
          { 'opacity-30 pointer-events-none': loading }
        )}
        style={{ minHeight: '6rem' }}
        onFocus={() => {
          editingRef.current = true
        }}
        // @ts-expect-error
        onChange={(event) => setEditor(event.target.value)}
        onBlur={() => {
          editingRef.current = false
          Promise.all([
            import('prettier/parser-babel'),
            import('prettier/standalone'),
            // The delay ensure that if the user tries to click on Verify the
            // click event have time to trigger before the textarea might change its height and push
            // the button out of view
            new Promise((resolve) => setTimeout(() => resolve(!0), 150)),
          ]).then(([{ default: babelParser }, { default: prettier }]) => {
            if (editingRef.current) return

            setEditor(
              prettier
                .format(editor, {
                  tabWidth: 4,
                  parser: 'json',
                  plugins: [babelParser],
                })
                .trim()
            )
          })
        }}
        value={editor}
        disabled={strategy !== 'parse'}
        required
      />
    </StrategyPanel>
  )
}

function SyncHistoryState() {
  const auth = useStore((state) => state.auth)

  useEffect(() => {
    localStorage.setItem('vcv.auth', auth)
  }, [auth])

  return null
}

function UrlField({ loading }: { loading: boolean }) {
  const setUrl = useStore((state) => state.setUrl)
  const url = useStore((state) => state.url)

  useLayoutEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    if (searchParams.has('url')) {
      try {
        const defaultUrl = new URL(searchParams.get('url'))
        setUrl(defaultUrl.toString())
      } catch {
        // we ignore any URL parser errors
      }
    }
  }, [])

  return (
    <label
      className={cx('block transition-opacity', {
        'opacity-30 pointer-events-none': loading,
      })}
    >
      <span className="text-gray-700 dark:text-gray-400">API URL</span>
      <input
        className={cx(
          'mt-1 h-10 block w-full rounded-md dark:bg-gray-900 border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-300 dark:focus:border-blue-600 focus:ring focus:ring-blue-200 dark:focus:ring-blue-900 focus:ring-opacity-50'
        )}
        type="url"
        onChange={(event) => setUrl(event.target.value)}
        value={url}
        readOnly={loading}
        required
      />
    </label>
  )
}

function AuthField({ loading }: { loading: boolean }) {
  const setAuth = useStore((state) => state.setAuth)
  const auth = useStore((state) => state.auth)

  useLayoutEffect(() => {
    if (localStorage.getItem('vcv.auth')) {
      try {
        setAuth(localStorage.getItem('vcv.auth'))
      } catch {
        // we ignore any URL parser errors
      }
    }
  }, [])

  return (
    <label
      className={cx('block transition-opacity', {
        'opacity-30 pointer-events-none': loading,
      })}
    >
      <span className="text-gray-700 dark:text-gray-400">Authorization</span>
      <input
        className={cx(
          'mt-1 h-10 block w-full rounded-md dark:bg-gray-900 border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-300 dark:focus:border-blue-600 focus:ring focus:ring-blue-200 dark:focus:ring-blue-900 focus:ring-opacity-50'
        )}
        placeholder="Bearer ..."
        type="text"
        onChange={(event) => setAuth(event.target.value)}
        value={auth}
        readOnly={loading}
      />
    </label>
  )
}

function FetchStrategy() {
  const state = useMachineState()
  const loading = [
    'fetching',
    'linkingData',
    'verifyingCredentials',
    'counterfeitingCredentials',
  ].some(state.matches)
  const { strategy } = state.context

  return (
    <StrategyPanel>
      <fieldset
        className={cx('grid gap-4 grid-cols-2', {
          'select-none': loading,
        })}
        disabled={strategy !== 'fetch'}
      >
        <UrlField loading={loading} />
        <AuthField loading={loading} />
        <SyncHistoryState />
      </fieldset>
    </StrategyPanel>
  )
}

function StrategyTab({
  index,
  ...props
}: {
  index: number
  children: React.ReactNode
}) {
  const { selectedIndex } = useTabsContext()
  return (
    <Tab
      className={cx(
        'px-3 py-1 font-semibold focus:outline-none transition-colors duration-300 focus-visible:ring-2 ring-gray-300 dark:ring-gray-700 rounded-full',
        {
          'text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800':
            selectedIndex === index,
          'text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-100':
            selectedIndex !== index,
        }
      )}
      {...props}
    />
  )
}

export default function Strategy() {
  const send = useMachineSend()
  const state = useMachineState()
  const idle = ['ready', 'success', 'failure'].some(state.matches)
  const getIndex = useCallback((state: Interpreter['state']) => {
    switch (state.context.strategy) {
      case 'demo':
        return 0
      case 'parse':
        return 1
      case 'fetch':
        return 2
    }
  }, [])

  return (
    <Tabs
      className="px-6 pt-8"
      index={getIndex(state)}
      onChange={(index) => {
        switch (index) {
          case 0:
            return send({ type: 'DEMO', input: '' })
          case 1:
            return send({ type: 'PARSE', input: '' })
          case 2:
            return send({ type: 'FETCH', input: '' })
        }
      }}
    >
      <TabList
        className={cx('flex flex-initial transition-opacity', {
          'opacity-30 pointer-events-none': !idle,
        })}
      >
        <StrategyTab index={0}>Demo</StrategyTab>
        <StrategyTab index={1}>Editor</StrategyTab>
        <StrategyTab index={2}>Fetch</StrategyTab>
      </TabList>
      <TabPanels className="mt-4">
        <DemoStrategy />
        <ParseStrategy />
        <FetchStrategy />
      </TabPanels>
    </Tabs>
  )
}
