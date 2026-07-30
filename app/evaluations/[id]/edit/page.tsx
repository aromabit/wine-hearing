import { notFound } from "next/navigation"
import { getEvaluation, getWine } from "@/lib/db"
import { updateEvaluation } from "@/lib/actions/evaluations"
import { EvaluationForm } from "@/components/evaluation-form"

const EditEvaluationPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  const evaluation = await getEvaluation(id)
  if (!evaluation) notFound()

  const wine = await getWine(evaluation.wineId)
  if (!wine) notFound()

  const action = updateEvaluation.bind(null, id)

  return (
    <div>
      <h2>{wine.name} の評価を編集</h2>
      <EvaluationForm action={action} wine={wine} initialEvaluation={evaluation} />
    </div>
  )
}

export default EditEvaluationPage
