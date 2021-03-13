import * as JSum from 'jsum'

export function jsonChecksum(json: unknown): string {
  return JSum.digest(json, 'SHA256', 'hex')
}

/*

useStore, semi local semi shared
useEffect(() => {

  if(transitioning to completed state, keep the logs and reports visible) {
    return () => {we are either being unmounted, or starting annother batch}
  }

}, [['ready', 'success', 'failure'].includes(state.value)])

*/

// move out of context, into zustand instead, so much simpler. first, make the Sequencer and use-asset
// Instead of fchecking results of previous runs, simply fire FAILURE events for future stepps in the ladder.