import { useCallback, useEffect, useRef, useState } from 'react'
import { ALGORITHMS } from '../algorithms/index.js'

export const SPEEDS = [
  { id: 1, label: 'Slow', delay: 600, batch: 1 },
  { id: 2, label: 'Normal', delay: 250, batch: 1 },
  { id: 3, label: 'Fast', delay: 60, batch: 1 },
  { id: 4, label: 'Very fast', delay: 16, batch: 8 },
  { id: 5, label: 'Max', delay: 0, batch: 250 },
]

const EMPTY_STATS = { generated: 0, expanded: 0, maxFrontier: 0, maxDepth: 0 }

function createSession() {
  return {
    generator: null,
    nodes: new Map(),
    stats: EMPTY_STATS,
    path: [],
    depthLimit: null,
    iteration: 0,
    activeId: null,
    outcome: null, // { solved: boolean, reason: string | null }
  }
}

function toSnapshot(session) {
  return {
    nodes: Array.from(session.nodes.values()),
    stats: session.stats,
    path: session.path,
    depthLimit: session.depthLimit,
    iteration: session.iteration,
    activeId: session.activeId,
    outcome: session.outcome,
  }
}

function applyEvent(session, event) {
  session.stats = event.stats

  switch (event.type) {
    case 'limit': // IDS starts a new iteration: the tree is rebuilt from scratch
      session.nodes = new Map()
      session.depthLimit = event.depthLimit
      session.iteration += 1
      session.activeId = null
      break
    case 'generate':
    case 'expand':
    case 'prune':
      session.nodes.set(event.node.id, event.node)
      session.activeId = event.node.id
      break
    case 'goal':
      for (const node of event.path) session.nodes.set(node.id, node)
      session.path = event.path
      session.activeId = event.node.id
      session.outcome = { solved: true, reason: null }
      break
    case 'fail':
      session.outcome = { solved: false, reason: event.reason }
      break
    default:
      break
  }
}

/**
 * status: 'idle' | 'running' | 'paused' | 'done'
 */
export function useSearchRunner({ algorithmId, initialState, options }) {
  const sessionRef = useRef(createSession())
  const timerRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [speedId, setSpeedId] = useState(2)
  const [snapshot, setSnapshot] = useState(() => toSnapshot(createSession()))

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  /** Pulls up to `count` events from the generator. Returns true when the search ended. */
  const advance = useCallback((count) => {
    const session = sessionRef.current
    if (!session.generator) return true

    let finished = false
    for (let i = 0; i < count; i++) {
      const { value, done } = session.generator.next()
      if (done) {
        finished = true
        break
      }
      applyEvent(session, value)
      if (value.type === 'goal' || value.type === 'fail') {
        finished = true
        break
      }
    }

    if (finished) session.generator = null
    setSnapshot(toSnapshot(session))
    return finished
  }, [])

  const startSession = useCallback(() => {
    clearTimer()
    const session = createSession()
    session.generator = ALGORITHMS[algorithmId].run([...initialState], options)
    sessionRef.current = session
    setSnapshot(toSnapshot(session))
  }, [algorithmId, initialState, options, clearTimer])

  // The run loop lives in an effect so pause/resume/speed changes are always up to date.
  useEffect(() => {
    if (status !== 'running') return undefined

    const { delay, batch } = SPEEDS.find((speed) => speed.id === speedId)
    const loop = () => {
      const finished = advance(batch)
      if (finished) {
        timerRef.current = null
        setStatus('done')
        return
      }
      timerRef.current = setTimeout(loop, delay)
    }

    timerRef.current = setTimeout(loop, 0)
    return clearTimer
  }, [status, speedId, advance, clearTimer])

  useEffect(() => clearTimer, [clearTimer])

  const run = useCallback(() => {
    startSession()
    setStatus('running')
  }, [startSession])

  const pause = useCallback(() => {
    setStatus((current) => (current === 'running' ? 'paused' : current))
  }, [])

  const resume = useCallback(() => {
    setStatus((current) => (current === 'paused' ? 'running' : current))
  }, [])

  const step = useCallback(() => {
    if (status === 'done') return
    if (status === 'idle') startSession()
    const finished = advance(1)
    setStatus(finished ? 'done' : 'paused')
  }, [status, startSession, advance])

  const skipToEnd = useCallback(() => {
    if (status === 'done') return
    if (status === 'idle') startSession()
    advance(Number.POSITIVE_INFINITY)
    setStatus('done')
  }, [status, startSession, advance])

  const reset = useCallback(() => {
    clearTimer()
    sessionRef.current = createSession()
    setSnapshot(toSnapshot(sessionRef.current))
    setStatus('idle')
  }, [clearTimer])

  return {
    status,
    speedId,
    setSpeedId,
    ...snapshot,
    run,
    pause,
    resume,
    step,
    skipToEnd,
    reset,
  }
}