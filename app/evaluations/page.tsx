import { listWines } from "@/lib/db"
import { EvaluationsListClient } from "@/components/evaluations-list-client"

const EvaluationsPage = async () => {
  const wines = await listWines()
  return <EvaluationsListClient wines={wines} />
}

export default EvaluationsPage
