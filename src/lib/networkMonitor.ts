// Store global (pub/sub) de requests HTTP pendientes, alimentado por los
// interceptores de axios en api/client.ts. No es un Context de React a
// propósito — no necesita re-renderizar el árbol de la app, solo notificar
// a quien esté suscrito (useSlowNetwork) cuando cambia el conteo.

type Listener = () => void

const pendingStartTimes = new Map<number, number>()
const listeners = new Set<Listener>()
let nextId = 0

function notify() {
  listeners.forEach((listener) => listener())
}

export function registerRequestStart(): number {
  const id = ++nextId
  pendingStartTimes.set(id, Date.now())
  notify()
  return id
}

export function registerRequestEnd(id: number) {
  if (pendingStartTimes.delete(id)) {
    notify()
  }
}

export function getPendingStartTimes(): number[] {
  return Array.from(pendingStartTimes.values())
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
