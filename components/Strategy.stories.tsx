import defaultMachine from '../lib/stateMachine'
import { useMachine } from '@xstate/react'
import { useState, Suspense } from 'react'
import DynamicStrategy, { StrategyLazy } from './Strategy.Lazy'
import { createAsset } from 'use-asset'

const hello = createAsset(async (foo, bar) => {
  console.log({ foo, bar })
  await new Promise((resolve) => setTimeout(() => resolve(void 0), 3000))
})

export const Primary = () => (
  <button className="min-h-full dark:text-white">Hello storybook!</button>
)

export const Loadable = () => {
  console.log('once')
  hello.read(1, 2)
  const [load, ssetLoade] = useState(false)
  console.log('twice')
  hello.read(2, 3)
  const [state, send, service] = useMachine(defaultMachine)
  console.log('thrice')
  hello.read(1, 2)

  return (
    <div className="grid w-full">
      <DynamicStrategy state={state} send={send} />
      <StrategyLazy
        // @ts-expect-error
        state={state}
        send={send}
      />
    </div>
  )
}

// Fallback + Mock
// Fallback + Loadable
// Fallback + Suspense

export default {
  title: 'State Machine/Strategy',
  decorators: [
    (Story) => (
      <Suspense fallback="Loading...">
        <Story />
      </Suspense>
    ),
  ],
}
