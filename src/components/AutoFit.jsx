import { useEffect } from 'react'
import { useReactFlow } from '@xyflow/react'

export default function AutoFit({ enabled, trigger }) {
  const { fitView } = useReactFlow()

  useEffect(() => {
    if (!enabled) return undefined
    const frame = requestAnimationFrame(() => fitView({ padding: 0.15, duration: 0 }))
    return () => cancelAnimationFrame(frame)
  }, [enabled, trigger, fitView])

  return null
}