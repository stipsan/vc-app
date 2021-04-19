import { useMachineSelector } from './contexts'
import type { StateMachineState } from './types'

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

function jsonldSelector(state: StateMachineState) {
  return state.context.jsonld
}
export function useJsonld() {
  return useMachineSelector(jsonldSelector)
}

function verifiedCredentialsSelector(state: StateMachineState) {
  return state.context.verifiedCredentials
}
export function useVerifiedCredentials() {
  return useMachineSelector(verifiedCredentialsSelector)
}

function counterfeitCredentialsSelector(state: StateMachineState) {
  return state.context.counterfeitCredentials
}
export function useCounterfeitCredentials() {
  return useMachineSelector(counterfeitCredentialsSelector)
}
