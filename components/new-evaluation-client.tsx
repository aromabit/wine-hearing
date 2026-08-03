"use client"

import { useSearchParams } from "next/navigation"
import { EvaluationForm } from "@/components/evaluation-form"
import { useEvaluation } from "@/lib/evaluation-store"
import { isRemoteStorageEnabled } from "@/lib/evaluation-api"

export const NewEvaluationClient = () => {
  const searchParams = useSearchParams()
  const editId = searchParams.get("editId")
  const { evaluation: initialEvaluation, loaded } = useEvaluation(editId)

  if (!loaded) return null

  return (
    <div>
      <h2>{initialEvaluation ? "評価を編集" : "新しい評価を追加"}</h2>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
        {isRemoteStorageEnabled
          ? "評価はクラウド（S3）に保存され、他の端末からも参照できます。"
          : "評価はこのブラウザ内（LocalStorage）に保存されます。"}
      </p>
      <EvaluationForm initialEvaluation={initialEvaluation} />
    </div>
  )
}
