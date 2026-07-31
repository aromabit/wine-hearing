import { Suspense } from "react"
import { NewEvaluationClient } from "@/components/new-evaluation-client"

const NewEvaluationPage = () => {
  return (
    <Suspense fallback={null}>
      <NewEvaluationClient />
    </Suspense>
  )
}

export default NewEvaluationPage
