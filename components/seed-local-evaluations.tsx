"use client"

import { useEffect } from "react"
import { seedLocalEvaluationsIfEmpty } from "@/lib/evaluation-store"
import { SEED_EVALUATIONS } from "@/lib/seed-evaluations"

export const SeedLocalEvaluations = () => {
  useEffect(() => {
    seedLocalEvaluationsIfEmpty(SEED_EVALUATIONS)
  }, [])

  return null
}
