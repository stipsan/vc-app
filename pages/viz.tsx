import dynamic from 'next/dynamic'
import { useMachine } from '@xstate/react'
import defaultMachine from '../lib/stateMachine'

import '@xstate/viz/themes/dark.css'

const MachineViz = dynamic(
  async () => (await import('@xstate/viz')).MachineViz,
  { ssr: false }
)

export default function Viz() {
  const [state, send, service] = useMachine(defaultMachine)

  console.log({
    context: state.context,
    value: state.value,
    event: state.event,
  })

  return (
    <>
      <style>{`html,body,#__next{height:100%;width: 100%;}`}</style>
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
                input:
                  state.context.items[
                    ~~(Math.random() * state.context.items.length)
                  ],
              })
            case 'FETCH_SUCCESS':
              return send(event.eventType, { input: [{}, {}, {}] })
            default:
              // @ts-expect-error
              return send(event.eventType, { input: {} })
          }
        }}
      />
    </>
  )
}
