"use client"

import { deleteWineAction } from "@/lib/actions/wines"
import { Button } from "@/components/elements/button"

export const DeleteWineButton = ({ wineId }: { wineId: string }) => {
  return (
    <form
      action={async () => {
        if (!confirm("このワインを削除しますか？関連する評価も残ります。")) return
        await deleteWineAction(wineId)
      }}
    >
      <Button type="submit" variant="danger">
        削除
      </Button>
    </form>
  )
}
