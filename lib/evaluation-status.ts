import { RATING_CRITERIA } from "./rating-criteria"
import { WineEvaluation } from "./types"

/** 官能評価項目（味覚・香り）が全て記入済みか。 */
export function isSensoryComplete(evaluation: WineEvaluation): boolean {
  return RATING_CRITERIA.every((criterion) => {
    const value = evaluation[criterion.id]
    return typeof value === "number" && !Number.isNaN(value)
  })
}

/** 自由コメントが記入済みか。 */
export function hasComment(evaluation: WineEvaluation): boolean {
  return Boolean(evaluation.comment?.trim())
}

/** 写真が1枚以上登録済みか。 */
export function hasImages(evaluation: WineEvaluation): boolean {
  return (evaluation.imageIds?.length ?? 0) > 0
}

/** 未記入の項目名一覧（官能・コメント・画像）。空配列なら全項目記入済み。 */
export function missingParts(
  evaluation: WineEvaluation,
  { includeImage }: { includeImage: boolean },
): string[] {
  const missing: string[] = []
  if (!isSensoryComplete(evaluation)) missing.push("官能")
  if (!hasComment(evaluation)) missing.push("コメント")
  if (includeImage && !hasImages(evaluation)) missing.push("画像")
  return missing
}
