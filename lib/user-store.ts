"use client"

import { useSyncExternalStore } from "react"
import { fetchRemoteUsers, isRemoteStorageEnabled, putRemoteUser } from "./user-api"
import { User } from "./types"

const STORAGE_KEY = "wine-users"

type Snapshot = {
  users: User[]
  loaded: boolean
}

const SERVER_SNAPSHOT: Snapshot = { users: [], loaded: false }

let snapshot: Snapshot = SERVER_SNAPSHOT
let initialized = false
const listeners = new Set<() => void>()

/** LocalStorage is a cache: it renders instantly and keeps the app usable offline. */
function readCache(): User[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User[]) : []
  } catch {
    return []
  }
}

function writeCache(users: User[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  } catch {
    // Quota errors must not break the in-memory state.
  }
}

function setSnapshot(users: User[], loaded: boolean): void {
  snapshot = { users, loaded }
  listeners.forEach((listener) => listener())
}

function initialize(): void {
  if (initialized) return
  initialized = true

  const cached = readCache()
  setSnapshot(cached, !isRemoteStorageEnabled)

  if (!isRemoteStorageEnabled) return

  fetchRemoteUsers()
    .then((users) => {
      writeCache(users)
      setSnapshot(users, true)
    })
    .catch((error: unknown) => {
      console.error("failed to load users from the API", error)
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

export async function createUser(user: User): Promise<void> {
  const previous = snapshot.users
  if (previous.some((item) => item.id === user.id)) {
    throw new Error("同じIDのユーザーが既に存在します")
  }
  const next = [...previous, user]
  writeCache(next)
  setSnapshot(next, true)

  if (!isRemoteStorageEnabled) return

  try {
    await putRemoteUser(user)
  } catch (error) {
    writeCache(previous)
    setSnapshot(previous, true)
    throw error
  }
}

export function useUsers(): Snapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
