import { useInterpret, useSelector, useService } from '@xstate/react'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import type { Interpreter, State, StateValue } from './stateMachine'
import defaultMachine from './stateMachine'

export const context = {
  machine: createContext<Interpreter>(null),
}

export function MachineProvider({ children }: { children: React.ReactNode }) {
  const { Provider } = context.machine
  const service = useInterpret(() => defaultMachine)

  return <Provider value={service}>{children}</Provider>
}
const ugh = () => {
  throw new TypeError('Missing MachineProvider!')
}
export function useMachineState() {
  const service = useContext(context.machine)
  if (service === null) ugh()
  const [state] = useService(service)
  return state as Exclude<State, 'value'> & {
    value: StateValue
  }
}

type SelectorState = Exclude<State, 'value'> & { value: StateValue }
export function useMachineSelector<T>(
  selector: (emitted: SelectorState) => T,
  compare?,
  getSnapshot?
) {
  const service = useContext(context.machine)
  if (service === null) ugh()
  return useSelector(service, selector, compare, getSnapshot)
}
export function useMachineSend() {
  const service = useContext(context.machine)
  if (service === null) ugh()

  //return service.send

  return useCallback(
    (...args: Parameters<typeof service.send>) =>
      // wrapping it in batchedUpdates cuts the amount of renders in more than half
      unstable_batchedUpdates(() => service.send(...args)),
    [service]
  )
}
export type SendType = Parameters<ReturnType<typeof useMachineSend>>

// Fire some cleanup logic when the state machine is starting over
export function useOnMachineReset(cb: Function) {
  const mounted = useRef(false)
  const idle = useMachineSelector(selectIdle)
  useEffect(() => {
    if (!idle) {
      if (!mounted.current) {
        mounted.current = true
      } else {
        unstable_batchedUpdates(() => cb())
      }
    }
  }, [idle, cb])
  // TODO: temporary debugger
  const debugRef = useRef(0)
  useEffect(() => {
    if (debugRef.current++ > 1) {
      console.error('cb changed!!', cb)
    }
  }, [cb])
}
function selectIdle(state: SelectorState) {
  switch (state.value) {
    case 'ready':
    case 'success':
    case 'failure':
      return true

    default:
      return false
  }
}
