import defaultMachine from './stateMachine'
import { useInterpret, useService, useSelector } from '@xstate/react'
import type { Interpreter, StateValue, State } from './stateMachine'
import documentLoader from './documentLoader'
import React, { createContext, useContext, useEffect } from 'react'

export const context = {
  machine: createContext<Interpreter>(null),
  documentLoader: createContext<typeof documentLoader>(null),
}

export function MachineProvider({ children }: { children: React.ReactNode }) {
  const { Provider } = context.machine
  const service = useInterpret(() => defaultMachine)

  useEffect(() => {
    console.log('MachineProvider service changed!', service)
  }, [service])

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

export function useMachineSelector<T>(
  selector: (emitted: Exclude<State, 'value'> & { value: StateValue }) => T,
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
  return service.send
}

export function DocumentLoaderProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
