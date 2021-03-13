import type { Interpreter } from './stateMachine'
import documentLoader from './documentLoader'
import { createContext } from 'react'

export const context = {
  machine: createContext<Interpreter>(null),
  documentLoader: createContext<typeof documentLoader>(null),
}

function MachineProvider() {
  return
}

function DocumentLoaderProvider() {
  return
}
