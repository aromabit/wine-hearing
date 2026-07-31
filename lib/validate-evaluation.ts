import { RATING_CRITERIA } from "./rating-criteria"
import { RatingCriterionId } from "./types"

export function validateEvaluationInput(
  body: Record<string, unknown>,
): { error: string } | { vector: Record<RatingCriterionId, number> } {
  if (!body.wineName || typeof body.wineName !== "string" || body.wineName.trim() === "") {
    return { error: "ワイン名は必須です" }
  }
  if (!body.evaluatorId || typeof body.evaluatorId !== "string") {
    return { error: "evaluatorId は必須です" }
  }

  const vector = {} as Record<RatingCriterionId, number>
  for (const criterion of RATING_CRITERIA) {
    const raw = body[criterion.id]
    const value = Number(raw)
    if (raw === undefined || raw === null || raw === "" || Number.isNaN(value)) {
      return { error: `${criterion.label} (${criterion.id}) は必須です` }
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
