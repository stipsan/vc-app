import { createMachine, AssignAction, State as MachineState, Interpreter as MachineInterpreter } from 'xstate'
import { createUpdater, ImmerUpdateEvent, assign } from '@xstate/immer'

interface Context {
  count: number
  status: string
  items: string[]
  json: Map<string, object>
  jsonld: Map<string, 'success' | 'failure'>
  verifiedCredentials: Map<string, 'success' | 'failure'>
  counterfeitCredentials: Map<string, 'success' | 'failure'>
}

/**
 * Control flow states
 * ready
 * fetching | parsing | uploading
 * linkingData
 * verifyingCredentials
 * counterfeitingCredentials
 * creatingPresentation (with all the vcs) https://github.com/transmute-industries/vc.js/blob/43440d7465fe6126460e89be3db6267c90c3bac5/packages/web-app-smoke-tester/src/test-ld.js#L33-L40
 * signingPresentation (with all the vcs) https://github.com/transmute-industries/vc.js/blob/43440d7465fe6126460e89be3db6267c90c3bac5/packages/web-app-smoke-tester/src/test-ld.js#L42-L47
 * verifyingPresentation https://github.com/transmute-industries/vc.js/blob/43440d7465fe6126460e89be3db6267c90c3bac5/packages/web-app-smoke-tester/src/test-ld.js#L49-L55
 * counterfeitingPresentation (adding a bogus credential)
 * success
 * failure
 */

/**
 * Context
 * items: [#1, #2, #3]
 * json: Map<#1, {}>()
 * jsonld: Map<#1, 'success' | 'failure'>()
 * verifiedCredentials: Map<#1, 'success' | 'failure'>()
 * counterfeitCredentials: Map<#1, 'success' | 'failure'>()
 */

type FetchEvent = ImmerUpdateEvent<'FETCH'>
type FetchFailureEvent = ImmerUpdateEvent<'FETCH_FAILURE', string>
type FetchSuccessEvent = ImmerUpdateEvent<'FETCH_SUCCESS', {}[]>
type LinkingDataFailureEvent = ImmerUpdateEvent<'LINKING_DATA_FAILURE', string>
type LinkingDataSuccessEvent = ImmerUpdateEvent<'LINKING_DATA_SUCCESS', string>
type LinkingDataCompleteEvent = ImmerUpdateEvent<
  'LINKING_DATA_COMPLETE',
  string
>
type VerifiedCredentialSuccessEvent = ImmerUpdateEvent<'VERIFIED_CREDENTIAL_SUCCESS', string>
type VerifiedCredentialFailureEvent = ImmerUpdateEvent<'VERIFIED_CREDENTIAL_FAILURE', string>
type VerifiedCredentialCompleteEvent = ImmerUpdateEvent<'VERIFIED_CREDENTIAL_COMPLETE', string>
type CounterfeitCredentialSuccessEvent = ImmerUpdateEvent<'COUNTERFEIT_CREDENTIAL_SUCCESS', string>
type CounterfeitCredentialFailureEvent = ImmerUpdateEvent<'COUNTERFEIT_CREDENTIAL_FAILURE', string>
type CounterfeitCredentialCompleteEvent = ImmerUpdateEvent<'COUNTERFEIT_CREDENTIAL_COMPLETE', string>

export type MachineEvent =
  | FetchEvent
  | FetchFailureEvent
  | FetchSuccessEvent
  | LinkingDataFailureEvent
  | LinkingDataSuccessEvent
  | LinkingDataCompleteEvent
  | VerifiedCredentialFailureEvent
  | VerifiedCredentialSuccessEvent
  | VerifiedCredentialCompleteEvent
  | CounterfeitCredentialFailureEvent
  | CounterfeitCredentialSuccessEvent
  | CounterfeitCredentialCompleteEvent

const fetchSuccess = createUpdater<Context, FetchSuccessEvent>(
  'FETCH_SUCCESS',
  (ctx, { input }) => {
    input.forEach((item, i) => {
      const id = `#${i + 1}`
      ctx.items.push(id)
      ctx.json.set(id, item)
    })
  }
)

const itemsIncludesInputCond = (
  ctx: Context,
  event: LinkingDataFailureEvent | LinkingDataSuccessEvent | VerifiedCredentialFailureEvent | VerifiedCredentialSuccessEvent | CounterfeitCredentialFailureEvent | CounterfeitCredentialSuccessEvent
) => {
  return ctx.items.includes(event.input)
}

const linkingDataFailure = createUpdater<Context, LinkingDataFailureEvent>(
  'LINKING_DATA_FAILURE',
  (ctx, { input }) => {
    ctx.jsonld.set(input, 'failure')
  }
)
const linkingDataSuccess = createUpdater<Context, LinkingDataSuccessEvent>(
  'LINKING_DATA_SUCCESS',
  (ctx, { input }) => {
    ctx.jsonld.set(input, 'success')
  }
)

const verifiedCredentialFailure = createUpdater<Context, VerifiedCredentialFailureEvent>(
  'VERIFIED_CREDENTIAL_FAILURE',
  (ctx, { input }) => {
    ctx.verifiedCredentials.set(input, 'failure')
  }
)
const verifiedCredentialSuccess = createUpdater<Context, VerifiedCredentialSuccessEvent>(
  'VERIFIED_CREDENTIAL_SUCCESS',
  (ctx, { input }) => {
    ctx.verifiedCredentials.set(input, 'success')
  }
)

const counterfeitCredentialFailure = createUpdater<Context, CounterfeitCredentialFailureEvent>(
  'COUNTERFEIT_CREDENTIAL_FAILURE',
  (ctx, { input }) => {
    ctx.counterfeitCredentials.set(input, 'failure')
  }
)
const counterfeitCredentialSuccess = createUpdater<Context, CounterfeitCredentialSuccessEvent>(
  'COUNTERFEIT_CREDENTIAL_SUCCESS',
  (ctx, { input }) => {
    ctx.counterfeitCredentials.set(input, 'success')
  }
)

export type State = MachineState<Context, MachineEvent>
export type Interpreter = MachineInterpreter<Context, State, MachineEvent>

export default createMachine<Context, MachineEvent>({
  context: {
    count: 0,
    status: '',
    // TODO: rename to ids
    items: [],
    json: new Map(),
    jsonld: new Map(),
    verifiedCredentials: new Map(),
    counterfeitCredentials: new Map(),
  },
  initial: 'ready',
  states: {
    ready: {
      on: {
        FETCH: 'fetching',
      },
    },
    fetching: {
      on: {
        FETCH_FAILURE: {
          target: 'failure',
          actions: assign((ctx, { input }) => {
            ctx.status = input
          }),
        },
        [fetchSuccess.type]: [
          { actions: fetchSuccess.action, target: 'linkingData' },
        ],
      },
    },
    linkingData: {
      on: {
        [linkingDataFailure.type]: {
          cond: itemsIncludesInputCond,
          actions: linkingDataFailure.action,
        },
        [linkingDataSuccess.type]: [
          { cond: itemsIncludesInputCond, actions: linkingDataSuccess.action },
        ],
        LINKING_DATA_COMPLETE: [
          {
            cond: (ctx) =>
              [...ctx.jsonld.values()].some((_) => _ === 'success'),
            target: 'verifyingCredentials',
          },
          'failure',
        ],
      },
    },
    verifyingCredentials: {
      on: {
        [verifiedCredentialFailure.type]: {
          cond: itemsIncludesInputCond,
          actions: verifiedCredentialFailure.action,
        },
        [verifiedCredentialSuccess.type]: [
          { cond: itemsIncludesInputCond, actions: verifiedCredentialSuccess.action },
        ],
        VERIFIED_CREDENTIAL_COMPLETE: [
          {
            cond: (ctx) =>
              [...ctx.verifiedCredentials.values()].some((_) => _ === 'success'),
            target: 'counterfeitingCredentials',
          },
          'failure',
        ],
      },
    },
    counterfeitingCredentials: {
      on: {
        [counterfeitCredentialFailure.type]: {
          cond: itemsIncludesInputCond,
          actions: counterfeitCredentialFailure.action,
        },
        [counterfeitCredentialSuccess.type]: [
          { cond: itemsIncludesInputCond, actions: counterfeitCredentialSuccess.action },
        ],
        COUNTERFEIT_CREDENTIAL_COMPLETE: [
          {
            cond: (ctx) =>
              [...ctx.counterfeitCredentials.values()].some((_) => _ === 'success'),
            target: 'success',
          },
          'failure',
        ],
      },
    },
    creatingPresentation: {    },
    signingPresentation: {    },
    verifyingPresentation: {    },
    counterfeitingPresentation: {    },
    success: {
      on: {
        FETCH: 'fetching',
      },
    },
    failure: {
      on: {
        FETCH: 'fetching',
      },
    },
  },
})
