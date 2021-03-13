import { useMachineSelector } from './contexts'
import type {StateMachineState}  from './types'

function idsSelector(state: StateMachineState) {
  return state.context.ids
}
export function useIdsList() {
  return useMachineSelector(idsSelector)
}

function jsonSelector(state: StateMachineState) {
  return state.context.json
}
export function useJsonMap() {
  return useMachineSelector(jsonSelector)
}