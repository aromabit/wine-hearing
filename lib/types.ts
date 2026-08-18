export type User = {
  id: string
  name: string
}

export type WineEvaluation = {
  id: string
  evaluatorId: string
  evaluatedAt: string

  wineName: string
  producer?: string
  grapeVarieties?: string[]
  country?: string
  region?: string
  vintage?: number
  wineAlcoholPercent?: number
  wineMemo?: string

  /** 官能評価（味覚・香り）。作成時は未記入のためnull（API側の必須number制約に合わせ、未記入は明示的にnullを送信する）。 */
  sweetness?: number | null
  acidity?: number | null
  bitterness?: number | null
  saltiness?: number | null
  tannin?: number | null
  astringency?: number | null
  alcohol?: number | null

  aromaIntensity?: number | null
  citrus?: number | null
  stoneFruit?: number | null
  tropical?: number | null
  redFruit?: number | null
  blackFruit?: number | null
  floral?: number | null
  herbal?: number | null
  spice?: number | null
  oak?: number | null
  nutty?: number | null
  earthy?: number | null

  comment?: string

  tastingTemperature?: number
  decanting?: boolean
  memo?: string

  /** 画像ID（UUID）の配列。最大 MAX_EVALUATION_IMAGES 枚。実体は S3 に別保存。 */
  imageIds?: string[]
}

export const MAX_EVALUATION_IMAGES = 3

export const RATING_CRITERION_IDS = [
  "sweetness",
  "acidity",
  "bitterness",
  "saltiness",
  "tannin",
  "astringency",
  "alcohol",
  "aromaIntensity",
  "citrus",
  "stoneFruit",
  "tropical",
  "redFruit",
  "blackFruit",
  "floral",
  "herbal",
  "spice",
  "oak",
  "nutty",
  "earthy",
] as const

export type RatingCriterionId = (typeof RATING_CRITERION_IDS)[number]

export type EvaluationVector = Record<RatingCriterionId, number | null>
