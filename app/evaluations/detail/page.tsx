import { Suspense } from "react"
import { listWines } from "@/lib/db"
import { EvaluationDetailClient } from "@/components/evaluation-detail-client"

const EvaluationDetailPage = async () => {
  const wines = await listWines()
  return (
    <Suspense fallback={null}>
      <EvaluationDetailClient wines={wines} />
    </Suspense>
  )
}

export default EvaluationDetailPage
