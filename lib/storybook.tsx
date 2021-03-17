// Placing components and CSS classNames outside stories.tsx files bloats the production build for next.js
// And the Storybook complains if there's no stories in files that have the stories.tsx suffix
// Keeping it in this file seems like an ok compromise?

import { useInterpret } from '@xstate/react'
import { context } from './contexts'
import defaultMachine from './stateMachine'
import { useEffect, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import ReportRow from '../components/ReportRow'
import { Panel } from '../components/Formatted'

export function StorySequence({ children }: { children: React.ReactNode }) {}

export function MachineProvider({
  children,
  fallback = (
    <ReportRow readyState="loading">
      <Panel>Syncing State Machine with Story...</Panel>
    </ReportRow>
  ),
  batch,
}: {
  children: React.ReactNode
  fallback?: any
  batch: any[]
}) {
  const { Provider } = context.machine
  const service = useInterpret(() => defaultMachine)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    unstable_batchedUpdates(() => {
      batch.forEach((action) => service.send(action))
      setReady(true)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!ready) {
    return fallback
  }

  return <Provider value={service}>{children}</Provider>
}
