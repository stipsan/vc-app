import {jsonChecksum} from '../lib/utils'
import { assign, createUpdater, ImmerUpdateEvent } from '@xstate/immer'
import {
  Interpreter as MachineInterpreter,
  Machine,
  State as MachineState,
} from 'xstate'

interface MachineSchema {
  states: {
    ready: {};
    failure: {};
    demoing: {},
    parsing: {},
    fetching: {},
    linkingData: {},
    verifyingCredentials: {},
    counterfeitingCredentials:{},
    verifyingPresentation:{},
    counterfeitingPresentation: {},
    success: {}
  };
}
export type StateValue = keyof MachineSchema['states']

interface Context {
  strategy: 'demo' | 'parse' | 'fetch'
  count: number
  status: string
  ids: string[]
  json: Map<string, object>
  jsonld: Map<string, 'success' | 'failure'>
  verifiedCredentials: Map<string, 'success' | 'failure'>
  counterfeitCredentials: Map<string, 'success' | 'failure'>
  verifiedPresentation: 'success' | 'failure' | 'pending'
  counterfeitPresentation: 'success' | 'failure' | 'pending'
}

type ExecEvent = ImmerUpdateEvent<'EXEC'>
type DemoEvent = ImmerUpdateEvent<'DEMO'>
type ParseEvent = ImmerUpdateEvent<'PARSE'>
type FetchEvent = ImmerUpdateEvent<'FETCH'>
type DemoFailureEvent = ImmerUpdateEvent<'DEMO_FAILURE', string>
type DemoSuccessEvent = ImmerUpdateEvent<'DEMO_SUCCESS', {}[]>
type ParseFailureEvent = ImmerUpdateEvent<'PARSE_FAILURE', string>
type ParseSuccessEvent = ImmerUpdateEvent<'PARSE_SUCCESS', {}[]>
type FetchFailureEvent = ImmerUpdateEvent<'FETCH_FAILURE', string>
type FetchSuccessEvent = ImmerUpdateEvent<'FETCH_SUCCESS', {}[]>
type LinkingDataFailureEvent = ImmerUpdateEvent<'LINKING_DATA_FAILURE', string>
type LinkingDataSuccessEvent = ImmerUpdateEvent<'LINKING_DATA_SUCCESS', string>
type LinkingDataCompleteEvent = ImmerUpdateEvent<
  'LINKING_DATA_COMPLETE',
  string
>
type VerifiedCredentialSuccessEvent = ImmerUpdateEvent<
  'VERIFIED_CREDENTIAL_SUCCESS',
  string
>
type VerifiedCredentialFailureEvent = ImmerUpdateEvent<
  'VERIFIED_CREDENTIAL_FAILURE',
  string
>
type VerifiedCredentialCompleteEvent = ImmerUpdateEvent<
  'VERIFIED_CREDENTIAL_COMPLETE',
  string
>
type CounterfeitCredentialSuccessEvent = ImmerUpdateEvent<
  'COUNTERFEIT_CREDENTIAL_SUCCESS',
  string
>
type CounterfeitCredentialFailureEvent = ImmerUpdateEvent<
  'COUNTERFEIT_CREDENTIAL_FAILURE',
  string
>
type CounterfeitCredentialCompleteEvent = ImmerUpdateEvent<
  'COUNTERFEIT_CREDENTIAL_COMPLETE',
  string
>
type VerifiedPresentationSuccessEvent = ImmerUpdateEvent<
  'VERIFIED_PRESENTATION_SUCCESS',
  string
>
type VerifiedPresentationFailureEvent = ImmerUpdateEvent<
  'VERIFIED_PRESENTATION_FAILURE',
  string
>
type CounterfeitPresentationSuccessEvent = ImmerUpdateEvent<
  'COUNTERFEIT_PRESENTATION_SUCCESS',
  string
>
type CounterfeitPresentationFailureEvent = ImmerUpdateEvent<
  'COUNTERFEIT_PRESENTATION_FAILURE',
  string
>

export type MachineEvent =
  | ExecEvent
  | DemoEvent
  | ParseEvent
  | FetchEvent
  | DemoFailureEvent
  | DemoSuccessEvent
  | ParseFailureEvent
  | ParseSuccessEvent
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
  | VerifiedPresentationFailureEvent
  | VerifiedPresentationSuccessEvent
  | CounterfeitPresentationFailureEvent
  | CounterfeitPresentationSuccessEvent

const exec = createUpdater<Context, ExecEvent>('EXEC', (ctx, event) => {
  ctx.status =
    ctx.strategy === 'demo'
      ? 'Generating...'
      : ctx.strategy === 'fetch'
      ? 'Fetching...'
      : ctx.strategy === 'parse'
      ? 'Parsing...'
      : ''
  // Keep track of how many times we've executed
  ctx.count += 1
  // Reset the context from previous exec runs
  ctx.ids.length = 0
  ctx.json.clear()
  ctx.jsonld.clear()
  ctx.verifiedCredentials.clear()
  ctx.counterfeitCredentials.clear()
  ctx.verifiedPresentation = 'pending'
  ctx.counterfeitPresentation = 'pending'
})

const demoSuccess = createUpdater<Context, DemoSuccessEvent>(
  'DEMO_SUCCESS',
  (ctx, { input }) => {
    ctx.status = 'Checking JSON-LD...'
    input.forEach((item, i) => {
      const id = jsonChecksum(item)
      if(!ctx.json.has(id)) {
        ctx.ids.push(id)
        ctx.json.set(id, item)
      }
    })
  }
)

const parseSuccess = createUpdater<Context, ParseSuccessEvent>(
  'PARSE_SUCCESS',
  (ctx, { input }) => {
    ctx.status = 'Checking JSON-LD...'
    input.forEach((item, i) => {
      const id = jsonChecksum(item)
      if(!ctx.json.has(id)) {
        ctx.ids.push(id)
        ctx.json.set(id, item)
      }
    })
  }
)

const fetchSuccess = createUpdater<Context, FetchSuccessEvent>(
  'FETCH_SUCCESS',
  (ctx, { input }) => {
    ctx.status = 'Checking JSON-LD...'
    input.forEach((item, i) => {
      const id = jsonChecksum(item)
      if(!ctx.json.has(id)) {
        ctx.ids.push(id)
        ctx.json.set(id, item)
      }
    })
  }
)

const idsIncludesInputCond = (
  ctx: Context,
  event:
    | LinkingDataFailureEvent
    | LinkingDataSuccessEvent
    | VerifiedCredentialFailureEvent
    | VerifiedCredentialSuccessEvent
    | CounterfeitCredentialFailureEvent
    | CounterfeitCredentialSuccessEvent
) => {
  return ctx.ids.includes(event.input)
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

const verifiedCredentialFailure = createUpdater<
  Context,
  VerifiedCredentialFailureEvent
>('VERIFIED_CREDENTIAL_FAILURE', (ctx, { input }) => {
  ctx.verifiedCredentials.set(input, 'failure')
})
const verifiedCredentialSuccess = createUpdater<
  Context,
  VerifiedCredentialSuccessEvent
>('VERIFIED_CREDENTIAL_SUCCESS', (ctx, { input }) => {
  ctx.verifiedCredentials.set(input, 'success')
})

const counterfeitCredentialFailure = createUpdater<
  Context,
  CounterfeitCredentialFailureEvent
>('COUNTERFEIT_CREDENTIAL_FAILURE', (ctx, { input }) => {
  ctx.counterfeitCredentials.set(input, 'failure')
})
const counterfeitCredentialSuccess = createUpdater<
  Context,
  CounterfeitCredentialSuccessEvent
>('COUNTERFEIT_CREDENTIAL_SUCCESS', (ctx, { input }) => {
  ctx.counterfeitCredentials.set(input, 'success')
})

export type State = MachineState<Context, MachineEvent>
export type Interpreter = MachineInterpreter<Context, State, MachineEvent>

const stateMachine = Machine<Context, MachineSchema, MachineEvent>({
  context: {
    strategy: 'demo',
    count: 0,
    status: '',
    ids: [],
    json: new Map(),
    jsonld: new Map(),
    verifiedCredentials: new Map(),
    counterfeitCredentials: new Map(),
    verifiedPresentation: 'pending',
    counterfeitPresentation: 'pending',
  },
  initial: 'ready',
  states: {
    failure: {
      on: {
        DEMO: {
          actions: assign((ctx) => {
            ctx.strategy = 'demo'
            ctx.status = ''
          }),
        },
        PARSE: {
          actions: assign((ctx) => {
            ctx.strategy = 'parse'
            ctx.status = ''
          }),
        },
        FETCH: {
          actions: assign((ctx) => {
            ctx.strategy = 'fetch'
            ctx.status = ''
          }),
        },
        [exec.type]: [
          {
            cond: function shouldDemo(ctx) {
              return ctx.strategy === 'demo'
            },
            actions: exec.action,
            target: 'demoing',
          },
          {
            cond: function shouldParse(ctx) {
              return ctx.strategy === 'parse'
            },
            actions: exec.action,
            target: 'parsing',
          },
          {
            cond: function shouldFetch(ctx) {
              return ctx.strategy === 'fetch'
            },
            actions: exec.action,
            target: 'fetching',
          },
        ],
      },
    },
    ready: {
      on: {
        DEMO: { actions: assign((ctx) => (ctx.strategy = 'demo')) },
        PARSE: { actions: assign((ctx) => (ctx.strategy = 'parse')) },
        FETCH: { actions: assign((ctx) => (ctx.strategy = 'fetch')) },
        [exec.type]: [
          {
            cond: function shouldDemo(ctx) {
              return ctx.strategy === 'demo'
            },
            actions: exec.action,
            target: 'demoing',
          },
          {
            cond: function shouldParse(ctx) {
              return ctx.strategy === 'parse'
            },
            actions: exec.action,
            target: 'parsing',
          },
          {
            cond: function shouldFetch(ctx) {
              return ctx.strategy === 'fetch'
            },
            actions: exec.action,
            target: 'fetching',
          },
        ],
      },
    },
    demoing: {
      on: {
        DEMO_FAILURE: {
          target: 'failure',
          actions: assign((ctx, { input }) => {
            ctx.status = input
          }),
        },
        [demoSuccess.type]: [
          { actions: demoSuccess.action, target: 'linkingData' },
        ],
      },
    },
    parsing: {
      on: {
        PARSE_FAILURE: {
          target: 'failure',
          actions: assign((ctx, { input }) => {
            ctx.status = input
          }),
        },
        [parseSuccess.type]: [
          { actions: parseSuccess.action, target: 'linkingData' },
        ],
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
          cond: idsIncludesInputCond,
          actions: linkingDataFailure.action,
        },
        [linkingDataSuccess.type]: [
          { cond: idsIncludesInputCond, actions: linkingDataSuccess.action },
        ],
        LINKING_DATA_COMPLETE: [
          {
            cond: function onlyFailures(ctx) {
              return ctx.ids.every((id) => ctx.jsonld.get(id) === 'failure')
            },
            actions: assign((ctx) => {
              ctx.status = 'Verification failed!'
            }),
            target: 'failure',
          },
          {
            cond: function allSettled(ctx) {
              return ctx.ids.every((id) => ctx.jsonld.has(id))
            },
            actions: assign(
              (ctx) =>
                (ctx.status =
                  [...ctx.jsonld.values()].filter((_) => _ === 'success')
                    .length === 1
                    ? 'Verifying Credential...'
                    : 'Verifying Credentials...')
            ),
            target: 'verifyingCredentials',
          },
        ],
      },
    },
    verifyingCredentials: {
      on: {
        [verifiedCredentialFailure.type]: {
          cond: idsIncludesInputCond,
          actions: verifiedCredentialFailure.action,
        },
        [verifiedCredentialSuccess.type]: [
          {
            cond: idsIncludesInputCond,
            actions: verifiedCredentialSuccess.action,
          },
        ],
        VERIFIED_CREDENTIAL_COMPLETE: [
          {
            cond: function onlyFailures(ctx) {
              return ctx.ids.every(
                (id) => ctx.verifiedCredentials.get(id) === 'failure'
              )
            },
            actions: assign((ctx) => {
              ctx.status = 'Verification failed!'
            }),
            target: 'failure',
          },
          {
            cond: function allSettled(ctx) {
              return ctx.ids.every((id) => ctx.verifiedCredentials.has(id))
            },
            actions: assign(
              (ctx) =>
                (ctx.status =
                  [...ctx.jsonld.values()].filter((_) => _ === 'success')
                    .length === 1
                    ? 'Counterfeiting Credential...'
                    : 'Counterfeiting Credentials...')
            ),
            target: 'counterfeitingCredentials',
          },
        ],
      },
    },
    counterfeitingCredentials: {
      on: {
        [counterfeitCredentialFailure.type]: {
          cond: idsIncludesInputCond,
          actions: counterfeitCredentialFailure.action,
        },
        [counterfeitCredentialSuccess.type]: [
          {
            cond: idsIncludesInputCond,
            actions: counterfeitCredentialSuccess.action,
          },
        ],
        COUNTERFEIT_CREDENTIAL_COMPLETE: [
          {
            cond: function someFailures(ctx) {
              return ctx.ids.some(
                (id) => ctx.counterfeitCredentials.get(id) === 'failure'
              )
            },
            actions: assign((ctx) => {
              ctx.status = 'Verification failed!'
            }),
            target: 'failure',
          },
          {
            cond: function allSettled(ctx) {
              return ctx.ids.every((id) => ctx.counterfeitCredentials.has(id))
            },
            actions: assign((ctx) => {
              ctx.status = 'Verifying Presentation...'
            }),
            target: 'verifyingPresentation',
          },
        ],
      },
    },
    verifyingPresentation: {
      on: {
        VERIFIED_PRESENTATION_FAILURE: {
          actions: assign((ctx) => {
            ctx.status = 'Verification failed!'
            ctx.verifiedPresentation = 'failure'
          }),
          target: 'failure',
        },
        VERIFIED_PRESENTATION_SUCCESS: [
          {
            actions: assign((ctx) => {
              ctx.status = 'Counterfeiting Presentation...'
              ctx.verifiedPresentation = 'success'
            }),
            target: 'counterfeitingPresentation',
          },
        ],
      },
    },
    counterfeitingPresentation: {
      on: {
        COUNTERFEIT_PRESENTATION_FAILURE: {
          actions: assign((ctx) => {
            ctx.status = 'Verification failed!'
            ctx.counterfeitPresentation = 'failure'
          }),
          target: 'failure',
        },
        COUNTERFEIT_PRESENTATION_SUCCESS: [
          {
            actions: assign((ctx) => {
              ctx.status = 'Verification successful!'
              ctx.counterfeitPresentation = 'success'
            }),
            target: 'success',
          },
        ],
      },
    },
    success: {
      on: {
        DEMO: {
          actions: assign((ctx) => {
            ctx.strategy = 'demo'
            ctx.status = ''
          }),
        },
        PARSE: {
          actions: assign((ctx) => {
            ctx.strategy = 'parse'
            ctx.status = ''
          }),
        },
        FETCH: {
          actions: assign((ctx) => {
            ctx.strategy = 'fetch'
            ctx.status = ''
          }),
        },
        [exec.type]: [
          {
            cond: function shouldDemo(ctx) {
              return ctx.strategy === 'demo'
            },
            actions: exec.action,
            target: 'demoing',
          },
          {
            cond: function shouldParse(ctx) {
              return ctx.strategy === 'parse'
            },
            actions: exec.action,
            target: 'parsing',
          },
          {
            cond: function shouldFetch(ctx) {
              return ctx.strategy === 'fetch'
            },
            actions: exec.action,
            target: 'fetching',
          },
        ],
      },
    },
  },
})

export default stateMachine