import { Suspense } from "react"
import { EvaluationDetailClient } from "@/components/evaluation-detail-client"

const EvaluationDetailPage = () => {
  return (
    <Suspense fallback={null}>
      <EvaluationDetailClient />
    </Suspense>
  )
}

export default EvaluationDetailPage
