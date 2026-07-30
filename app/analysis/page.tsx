import { listWines } from "@/lib/db"
import { PcaScatterClient } from "@/components/pca-scatter-client"

const AnalysisPage = async () => {
  const wines = await listWines()
  return <PcaScatterClient wines={wines} />
}

export default AnalysisPage
