import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'
import { useEffect, useRef } from 'react'
import { useStore } from '../lib/useStore'

const Celebrate = () => {
  const { width, height } = useWindowSize()
  const onceRef = useRef(false)
  const success = useStore((state) => state.success)

  useEffect(() => {
    if (success) {
      return () => {
        onceRef.current = true
      }
    }
  }, [success])

  if (success && !onceRef.current) {
    return (
      <div className="fixed top-0 left-0 z-20 pointer-events-none transform-gpu">
        <Confetti recycle={false} width={width} height={height} />
      </div>
    )
  }

  return null
}

export default Celebrate
