import { WineEvaluation } from "./types"

const STORAGE_KEY = "wine-evaluations"

function readAll(): WineEvaluation[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as WineEvaluation[]) : []
  } catch {
    return []
  }
}

function writeAll(evaluations: WineEvaluation[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluations))
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }))
}

export function saveLocalEvaluation(evaluation: WineEvaluation): void {
  const evaluations = readAll()
  const index = evaluations.findIndex((e) => e.id === evaluation.id)
  if (index === -1) {
    evaluations.push(evaluation)
  } else {
    evaluations[index] = evaluation
  }
  writeAll(evaluations)
}

export function deleteLocalEvaluation(id: string): void {
  writeAll(readAll().filter((evaluation) => evaluation.id !== id))
}
