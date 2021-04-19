import { useCallback, useState } from 'react'
import Confetti from 'react-confetti'
import { useReduceMotion } from 'react-reduce-motion'
import { useMachineSelector } from '../lib/contexts'

function Celebration() {
  const [mounted, setMounted] = useState(true)

  if (!mounted) return null

  return (
    <Confetti
      height={window.innerHeight}
      onConfettiComplete={() => setMounted(false)}
      recycle={false}
      width={window.innerWidth}
    />
  )
}

export default function CelebrateGate() {
  const reducedMotion = useReduceMotion()
  const success = useMachineSelector(
    useCallback((state) => state.value === 'success', [])
  )

  if (reducedMotion || !success) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 z-50 pointer-events-none transform-gpu">
      <Celebration />
    </div>
  )
}
