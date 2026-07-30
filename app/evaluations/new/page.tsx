import { Suspense } from "react"
import { listWines } from "@/lib/db"
import { NewEvaluationClient } from "@/components/new-evaluation-client"

const NewEvaluationPage = async () => {
  const wines = await listWines()
  return (
    <Suspense fallback={null}>
      <NewEvaluationClient wines={wines} />
    </Suspense>
  )
}

export default NewEvaluationPage
