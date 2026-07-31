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

  sweetness: number
  acidity: number
  bitterness: number
  saltiness: number
  tannin: number
  astringency: number
  alcohol: number

  aromaIntensity: number
  citrus: number
  stoneFruit: number
  tropical: number
  redFruit: number
  blackFruit: number
  floral: number
  herbal: number
  spice: number
  oak: number
  nutty: number
  earthy: number

  comment?: string

  tastingTemperature?: number
  decanting?: boolean
  memo?: string
}

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

export type EvaluationVector = Record<RatingCriterionId, number>
