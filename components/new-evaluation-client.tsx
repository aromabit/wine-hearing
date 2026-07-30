"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Wine } from "@/lib/types"
import { EvaluationForm } from "@/components/evaluation-form"
import { useLocalEvaluation } from "@/lib/use-local-evaluations"

export const NewEvaluationClient = ({ wines }: { wines: Wine[] }) => {
  const searchParams = useSearchParams()
  const wineId = searchParams.get("wineId")
  const editId = searchParams.get("editId")
  const { evaluation: initialEvaluation, loaded } = useLocalEvaluation(editId)

  const wine = wines.find((w) => w.id === wineId)

  if (!wine) {
    return (
      <div>
        <h2>評価対象ワインを選択してください</h2>
        <p>
          <Link href="/wines">ワイン一覧</Link> から評価するワインを選び、
          「評価を追加」を押してください。
        </p>
      </div>
    )
  }

  if (!loaded) return null

  return (
    <div>
      <h2>{wine.name} を評価</h2>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
        評価はこのブラウザ内（LocalStorage）に保存されます。
      </p>
      <EvaluationForm wine={wine} initialEvaluation={initialEvaluation} />
    </div>
  )
}
