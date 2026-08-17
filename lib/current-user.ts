"use client"

import { useSyncExternalStore } from "react"

const STORAGE_KEY = "wine-current-user-id"

let cached: string | null | undefined
const listeners = new Set<() => void>()

function read(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function getSnapshot(): string | null {
  if (cached === undefined) cached = read()
  return cached
}

function getServerSnapshot(): string | null {
  return null
}

function subscribe(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return
    cached = read()
    callback()
  }
  listeners.add(callback)
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(callback)
    window.removeEventListener("storage", onStorage)
  }
}

function notify(): void {
  listeners.forEach((listener) => listener())
}

export function setCurrentUserId(id: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // Quota errors must not break the in-memory state.
  }
  cached = id
  notify()
}

export function clearCurrentUserId(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
  cached = null
  notify()
}

export function useCurrentUserId(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
