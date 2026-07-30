import Link from "next/link"
import { getWine } from "@/lib/db"
import { createEvaluation } from "@/lib/actions/evaluations"
import { EvaluationForm } from "@/components/evaluation-form"

const NewEvaluationPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ wineId?: string }>
}) => {
  const { wineId } = await searchParams
  const wine = wineId ? await getWine(wineId) : undefined

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

  return (
    <div>
      <h2>{wine.name} を評価</h2>
      <EvaluationForm action={createEvaluation} wine={wine} />
    </div>
  )
}

export default NewEvaluationPage
