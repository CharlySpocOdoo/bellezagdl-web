import { useEffect, useState } from 'react'
import { getPendingStartTimes, subscribe } from '../lib/networkMonitor'

const SLOW_THRESHOLD_MS = 6000
const CHECK_INTERVAL_MS = 1000

// true mientras al menos una request lleve >= SLOW_THRESHOLD_MS pendiente.
// El polling por intervalo solo corre mientras haya requests pendientes —
// evita overhead en navegación normal.
export function useSlowNetwork(): boolean {
  const [isSlow, setIsSlow] = useState(false)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    const evaluate = () => {
      const now = Date.now()
      const slow = getPendingStartTimes().some((start) => now - start >= SLOW_THRESHOLD_MS)
      setIsSlow(slow)
    }

    const syncInterval = () => {
      const hasPending = getPendingStartTimes().length > 0
      if (hasPending && !interval) {
        interval = setInterval(evaluate, CHECK_INTERVAL_MS)
      } else if (!hasPending && interval) {
        clearInterval(interval)
        interval = null
        setIsSlow(false)
      }
    }

    const unsubscribe = subscribe(() => {
      evaluate()
      syncInterval()
    })

    syncInterval()

    return () => {
      unsubscribe()
      if (interval) clearInterval(interval)
    }
  }, [])

  return isSlow
}
