"use client"

import { useEffect } from "react"
import { SEED_EVALUATIONS } from "@/lib/seed-evaluations"

const STORAGE_KEY = "wine-evaluations"

export const SeedLocalEvaluations = () => {
  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) === null) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_EVALUATIONS))
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }))
    }
  }, [])

  return null
}
