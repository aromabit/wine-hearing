"use client"

import { deleteEvaluationAction } from "@/lib/actions/evaluations"
import { Button } from "@/components/elements/button"

export const DeleteEvaluationButton = ({ evaluationId }: { evaluationId: string }) => {
  return (
    <form
      action={async () => {
        if (!confirm("この評価を削除しますか？")) return
        await deleteEvaluationAction(evaluationId)
      }}
    >
      <Button type="submit" variant="danger">
        削除
      </Button>
    </form>
  )
}
