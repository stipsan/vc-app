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
  console.log('preload')
  hello.preload(1, 2)
  hello.preload(2, 3)

  console.log('once')
  hello.read(1, 2)
  const [load, setLoad] = useState(false)
  console.log('twice', load, setLoad)
  hello.read(2, 3)
  const [state, send, service] = useMachine(defaultMachine)
  console.log('thrice', state, send, service)
  hello.read(1, 2)

  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-4">
      <DynamicStrategy />
      <StrategyLazy isLoading={true} />
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
      <>
        <button onClick={() => console.log('handle', hello)}>tap</button>
        <Suspense fallback="Loading...">
          <Story />
        </Suspense>
      </>
    ),
  ],
}
