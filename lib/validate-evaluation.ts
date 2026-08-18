import { RATING_CRITERIA } from "./rating-criteria"
import { RatingCriterionId } from "./types"

export function validateEvaluationInput(
  body: Record<string, unknown>,
): { error: string } | { vector: Partial<Record<RatingCriterionId, number | null>> } {
  if (!body.evaluatorId || typeof body.evaluatorId !== "string") {
    return { error: "evaluatorId は必須です" }
  }

  const vector: Partial<Record<RatingCriterionId, number | null>> = {}
  for (const criterion of RATING_CRITERIA) {
    const raw = body[criterion.id]
    // 未操作のスライダーは未送信 → API側は必須numberのため、未記入は明示的にnullを送る。
    if (raw === undefined || raw === null || raw === "") {
      vector[criterion.id] = null
      continue
    }

    const value = Number(raw)
    if (Number.isNaN(value)) {
      return { error: `${criterion.label} (${criterion.id}) の値が不正です` }
    }
    if (value < criterion.min || value > criterion.max) {
      return {
        error: `${criterion.label} (${criterion.id}) は ${criterion.min}〜${criterion.max} の範囲で入力してください`,
      }
    }
    vector[criterion.id] = value
  }

  return { vector }
}
