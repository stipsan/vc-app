import { useCallback, useEffect, useRef } from 'react'
import scrollIntoView from 'smooth-scroll-into-view-if-needed'
import { useMachineSelector } from '../lib/contexts'

export default function ScrollTo() {
  // TODO replace with logic that observes when things load before the fold, and show a down arrow that can be clicked
  //      offer a checkbox to opt-out of auto scroll
  const value = useMachineSelector(useCallback((state) => state.value, []))
  const nodeRef = useRef()

  useEffect(() => {
    switch (value) {
      case 'demoing':
      case 'parsing':
      case 'fetching':
      case 'linkingData':
      case 'verifyingCredentials':
      case 'counterfeitingCredentials':
      case 'verifyingPresentation':
      case 'failure':
      case 'success':
        requestAnimationFrame(
          () =>
            nodeRef.current &&
            scrollIntoView(nodeRef.current, {
              behavior: 'smooth',
              scrollMode: 'if-needed',
              block: 'nearest',
            })
        )
        return
    }
  }, [value])

  return <span ref={nodeRef} />
}
