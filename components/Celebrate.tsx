import { useCallback, useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import { useMachineSelector } from '../lib/contexts'
import * as React from 'react'

console.log({ React })

function Celebration() {
  return //
}

export default function CelebrateGate() {
  const success = useMachineSelector(
    useCallback((state) => state.value === 'success', [])
  )
  const [unmount, doUnmount] = useState(false)

  useEffect(() => {
    if (success) {
      return () => {
        setTimeout(() => doUnmount(true), 10000)
      }
    }
  }, [success])

  if (unmount || !success) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 z-50 pointer-events-none transform-gpu">
      <Confetti
        recycle={false}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  )
}
