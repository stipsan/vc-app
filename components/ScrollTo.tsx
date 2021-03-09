import { useEffect, useRef } from 'react'
import scrollIntoView from 'smooth-scroll-into-view-if-needed'
import { Interpreter } from '../lib/stateMachine'

export default function ScrollTo({ state }: { state: Interpreter['state'] }) {
  const nodeRef = useRef()
  const fetching = state.matches('fetching')
  const linkingData = state.matches('linkingData')
  const verifyingCredentials = state.matches('verifyingCredentials')
  const counterfeitingCredentials = state.matches('counterfeitingCredentials')
  const failure = state.matches('failure')
  const success = state.matches('success')

  useEffect(() => {
    switch (true) {
      case fetching:
      case linkingData:
      case verifyingCredentials:
      case counterfeitingCredentials:
      case failure:
      case success:
        return (
          nodeRef.current &&
          scrollIntoView(nodeRef.current, {
            behavior: 'smooth',
            scrollMode: 'if-needed',
            block: 'nearest',
          })
        )
    }
  }, [
    fetching,
    linkingData,
    verifyingCredentials,
    counterfeitingCredentials,
    failure,
    success,
  ])

  return <span ref={nodeRef} />
}
