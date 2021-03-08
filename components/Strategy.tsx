import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useTabsContext,
} from '@reach/tabs'
import cx from 'classnames'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import type { Interpreter } from '../lib/stateMachine'
import { useStore } from '../lib/useStore'
import Textarea from 'react-expanding-textarea'
import prettier from 'prettier/standalone'
import babelParser from 'prettier/parser-babel'

function StrategyPanel({ children }: { children: React.ReactNode }) {
  return (
    <TabPanel className="focus:outline-none bg-white rounded-md focus-visible:ring ring-blue-200 ring-offset-4">
      {children}
    </TabPanel>
  )
}

function DemoStrategy({
  send,
  state,
}: {
  send: Interpreter['send']
  state: Interpreter['state']
}) {
  return (
    <StrategyPanel>
      <div className="rounded-lg py-2 px-3 bg-gray-50 ">
        Create a few mock Verifiable Credentials to demonstrate the verification
        flow.
      </div>
    </StrategyPanel>
  )
}

function ParseStrategy({
  send,
  state,
}: {
  send: Interpreter['send']
  state: Interpreter['state']
}) {
  const setEditor = useStore((state) => state.setEditor)
  const editor = useStore((state) => state.editor)
  const { strategy } = state.context

  return (
    <StrategyPanel>
      <Textarea
        spellCheck={false}
        placeholder="Paste your JSON in here..."
        className={cx(
          'mt-1 h-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
        )}
        // @ts-expect-error
        onChange={(event) => setEditor(event.target.value)}
        onBlur={() => {
          try {
            const prettyEditor = prettier
              .format(editor, {
                tabWidth: 4,
                parser: 'json',
                plugins: [babelParser],
              })
              .trim()
            setEditor(prettyEditor)
          } catch {
            // Do nothing
          }
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

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
      className={cx('block transition-opacity duration-150', {
        'opacity-30 pointer-events-none': loading,
      })}
    >
      <span className="text-gray-700">API URL</span>
      <input
        className={cx(
          'mt-1 h-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
        )}
        type="url"
        onChange={(event) => setUrl(event.target.value)}
        value={url}
        readOnly={!mounted || loading}
        required
      />
    </label>
  )
}

function AuthField({ loading }: { loading: boolean }) {
  const setAuth = useStore((state) => state.setAuth)
  const auth = useStore((state) => state.auth)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

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
      className={cx('block transition-opacity duration-150', {
        'opacity-30 pointer-events-none': loading,
      })}
    >
      <span className="text-gray-700">Authorization</span>
      <input
        className={cx(
          'mt-1 h-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
        )}
        placeholder="Bearer ..."
        type="text"
        onChange={(event) => setAuth(event.target.value)}
        value={auth}
        readOnly={!mounted || loading}
      />
    </label>
  )
}

function FetchStrategy({
  send,
  state,
}: {
  send: Interpreter['send']
  state: Interpreter['state']
}) {
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
          'select-none bg-gradient-to-t rounded-md': loading,
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
  const { selectedIndex, focusedIndex } = useTabsContext()
  return (
    <Tab
      className={cx(
        'px-3 py-1 font-semibold focus:outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-offset-white focus-visible:ring-gray-300 rounded-full',
        {
          'text-gray-900 bg-gray-100': selectedIndex === index,
          'text-gray-400 hover:text-gray-900': selectedIndex !== index,
        }
      )}
      {...props}
    />
  )
}

export default function Strategy({
  state,
  send,
}: {
  state: Interpreter['state']
  send: Interpreter['send']
}) {
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
      <TabList className="flex flex-initial">
        <StrategyTab index={0}>Demo</StrategyTab>
        <StrategyTab index={1}>Editor</StrategyTab>
        <StrategyTab index={2}>Fetch</StrategyTab>
      </TabList>
      <TabPanels className="mt-4">
        <DemoStrategy state={state} send={send} />
        <ParseStrategy state={state} send={send} />
        <FetchStrategy state={state} send={send} />
      </TabPanels>
    </Tabs>
  )
}
