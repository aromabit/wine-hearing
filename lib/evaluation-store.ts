"use client"

import { useMemo, useSyncExternalStore } from "react"
import {
  deleteRemoteEvaluation,
  fetchRemoteEvaluations,
  isRemoteStorageEnabled,
  putRemoteEvaluation,
} from "./evaluation-api"
import { WineEvaluation } from "./types"

const STORAGE_KEY = "wine-evaluations"

type Snapshot = {
  evaluations: WineEvaluation[]
  loaded: boolean
}

const SERVER_SNAPSHOT: Snapshot = { evaluations: [], loaded: false }

let snapshot: Snapshot = SERVER_SNAPSHOT
let initialized = false
const listeners = new Set<() => void>()

/** LocalStorage is a cache: it renders instantly and keeps the app usable offline. */
function readCache(): WineEvaluation[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as WineEvaluation[]) : []
  } catch {
    return []
  }
}

function writeCache(evaluations: WineEvaluation[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluations))
  } catch {
    // Quota errors must not break the in-memory state.
  }
}

function setSnapshot(evaluations: WineEvaluation[], loaded: boolean): void {
  snapshot = { evaluations, loaded }
  listeners.forEach((listener) => listener())
}

function initialize(): void {
  if (initialized) return
  initialized = true

  const cached = readCache()
  setSnapshot(cached, !isRemoteStorageEnabled)

  if (!isRemoteStorageEnabled) return

  fetchRemoteEvaluations()
    .then((evaluations) => {
      writeCache(evaluations)
      setSnapshot(evaluations, true)
    })
    .catch((error: unknown) => {
      console.error("failed to load evaluations from the API", error)
      setSnapshot(readCache(), true)
    })
}

function subscribe(callback: () => void): () => void {
  initialize()
  listeners.add(callback)
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return
    setSnapshot(readCache(), snapshot.loaded)
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(callback)
    window.removeEventListener("storage", onStorage)
  }
}

function getSnapshot(): Snapshot {
  return snapshot
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT
}

/**
 * Applies an optimistic local update, then persists it remotely. The local
 * state is rolled back when the API call fails so the UI never claims a save
 * that did not happen.
 */
async function commit(
  next: WineEvaluation[],
  persist: () => Promise<void>
): Promise<void> {
  const previous = snapshot.evaluations
  writeCache(next)
  setSnapshot(next, true)

  if (!isRemoteStorageEnabled) return

  try {
    await persist()
  } catch (error) {
    writeCache(previous)
    setSnapshot(previous, true)
    throw error
  }
}

export async function saveEvaluation(
  evaluation: WineEvaluation
): Promise<void> {
  const evaluations = snapshot.evaluations
  const index = evaluations.findIndex((item) => item.id === evaluation.id)
  const next =
    index === -1
      ? [...evaluations, evaluation]
      : evaluations.map((item, i) => (i === index ? evaluation : item))

  await commit(next, () => putRemoteEvaluation(evaluation))
}

export async function deleteEvaluation(id: string): Promise<void> {
  const next = snapshot.evaluations.filter((evaluation) => evaluation.id !== id)
  await commit(next, () => deleteRemoteEvaluation(id))
}

/** Seeds sample data into the local cache only, never into the shared bucket. */
export function seedLocalEvaluationsIfEmpty(seed: WineEvaluation[]): void {
  if (isRemoteStorageEnabled) return
  if (window.localStorage.getItem(STORAGE_KEY) !== null) return
  writeCache(seed)
  setSnapshot(seed, true)
}

export function useEvaluations(): Snapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function useEvaluation(id: string | null): {
  evaluation: WineEvaluation | undefined
  loaded: boolean
} {
  const { evaluations, loaded } = useEvaluations()
  const evaluation = useMemo(
    () => (id ? evaluations.find((item) => item.id === id) : undefined),
    [evaluations, id]
  )
  return { evaluation, loaded }
}
