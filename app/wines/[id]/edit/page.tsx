import { notFound } from "next/navigation"
import { getWine } from "@/lib/db"
import { updateWine } from "@/lib/actions/wines"
import { WineForm } from "@/components/wine-form"

const EditWinePage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  const wine = await getWine(id)
  if (!wine) notFound()

  const action = updateWine.bind(null, id)

  return (
    <div>
      <h2>ワイン編集</h2>
      <WineForm action={action} initialWine={wine} />
    </div>
  )
}

export default EditWinePage
