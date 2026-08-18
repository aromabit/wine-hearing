"use client"

import { useSearchParams } from "next/navigation"
import { EvaluationForm } from "@/components/evaluation-form"
import { useEvaluation } from "@/lib/evaluation-store"

export const NewEvaluationClient = () => {
  const searchParams = useSearchParams()
  const editId = searchParams.get("editId")
  const { evaluation: initialEvaluation, loaded } = useEvaluation(editId)

  if (!loaded) return null

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>
        {initialEvaluation ? "評価を編集" : "新しい評価を追加"}
      </h2>
      <EvaluationForm initialEvaluation={initialEvaluation} />
    </div>
  )
}
