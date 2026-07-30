import { createWine } from "@/lib/actions/wines"
import { WineForm } from "@/components/wine-form"

const NewWinePage = () => {
  return (
    <div>
      <h2>ワイン登録</h2>
      <WineForm action={createWine} />
    </div>
  )
}

export default NewWinePage
