import faker from 'faker'
import dynamic from 'next/dynamic'
import { useMachine } from '@xstate/react'
import defaultMachine from '../lib/stateMachine'

import '@xstate/viz/themes/dark.css'

const MachineViz = dynamic(
  async () =>
    (await import(/* webpackChunkName: "viz" */ '@xstate/viz')).MachineViz,
  { ssr: false }
)

let needle = 0

export default function Viz() {
  const [state, send] = useMachine(defaultMachine)

  console.group(state.event.type)
  console.log('event.input', state.event.input)
  console.log('state.value', state.value)
  console.debug({ state })
  console.log('...state.context', { ...state.context })
  console.groupEnd()

  return (
    <>
      <style>{`html,body,#__next{height:100%;width: 100%;font-size: 10px;}`}</style>
      <MachineViz
        machine={defaultMachine}
        state={state}
        onEventTap={(event) => {
          switch (event.eventType) {
            case 'LINKING_DATA_FAILURE':
            case 'LINKING_DATA_SUCCESS':
            case 'VERIFIED_CREDENTIAL_FAILURE':
            case 'VERIFIED_CREDENTIAL_SUCCESS':
            case 'COUNTERFEIT_CREDENTIAL_FAILURE':
            case 'COUNTERFEIT_CREDENTIAL_SUCCESS':
              return send(event.eventType, {
                input: state.context.ids[needle++ % state.context.ids.length],
              })
            case 'DEMO_SUCCESS':
            case 'PARSE_SUCCESS':
            case 'FETCH_SUCCESS':
              // uncomment this to test scenarios where *_COMPLETE events require multiple *_{SUCCESS|FAILURE} events to proceed
              // return send(event.eventType, { input: [{}, {}, {}] })
              return send(event.eventType, {
                input: [{ name: faker.name.findName() }],
              })
            default:
              // @ts-expect-error
              return send(event.eventType, { input: {} })
          }
        }}
      />
    </>
  )
}
