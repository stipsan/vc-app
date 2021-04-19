import { useCallback, useEffect, useRef } from 'react'
import { useReduceMotion } from 'react-reduce-motion'
import scrollIntoView from 'smooth-scroll-into-view-if-needed'
import { useMachineSelector } from '../lib/contexts'

export default function ScrollTo() {
  const reducedMotion = useReduceMotion()
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
              // TODO: make a fix on smooth-scroll-into-view to allow 'instant'
              // @ts-expect-error
              behavior: reducedMotion ? 'instant' : 'smooth',
              scrollMode: 'if-needed',
              block: 'nearest',
            })
        )
        return
    }
  }, [value, reducedMotion])

  return <span ref={nodeRef} />
}
