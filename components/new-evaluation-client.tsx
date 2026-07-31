"use client"

import { useSearchParams } from "next/navigation"
import { EvaluationForm } from "@/components/evaluation-form"
import { useLocalEvaluation } from "@/lib/use-local-evaluations"

export const NewEvaluationClient = () => {
  const searchParams = useSearchParams()
  const editId = searchParams.get("editId")
  const { evaluation: initialEvaluation, loaded } = useLocalEvaluation(editId)

  if (!loaded) return null

  return (
    <div>
      <h2>{initialEvaluation ? "評価を編集" : "新しい評価を追加"}</h2>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
        評価はこのブラウザ内（LocalStorage）に保存されます。
      </p>
      <EvaluationForm initialEvaluation={initialEvaluation} />
    </div>
  )
}
