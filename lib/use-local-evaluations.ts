"use client"

import { useMemo, useSyncExternalStore } from "react"
import { WineEvaluation } from "./types"

const STORAGE_KEY = "wine-evaluations"
const SERVER_SNAPSHOT = "__server__"

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) ?? "[]"
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT
}

function parse(raw: string): WineEvaluation[] {
  try {
    return JSON.parse(raw) as WineEvaluation[]
  } catch {
    return []
  }
}

function useRawEvaluations(): { raw: string; loaded: boolean } {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return { raw, loaded: raw !== SERVER_SNAPSHOT }
}

export function useLocalEvaluations(): {
  evaluations: WineEvaluation[]
  loaded: boolean
} {
  const { raw, loaded } = useRawEvaluations()
  const evaluations = useMemo(() => (loaded ? parse(raw) : []), [raw, loaded])
  return { evaluations, loaded }
}

export function useLocalEvaluation(
  id: string | null,
): { evaluation: WineEvaluation | undefined; loaded: boolean } {
  const { evaluations, loaded } = useLocalEvaluations()
  const evaluation = useMemo(
    () => (id ? evaluations.find((e) => e.id === id) : undefined),
    [evaluations, id],
  )
  return { evaluation, loaded }
}
