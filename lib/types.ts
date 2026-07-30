export type Wine = {
  id: string
  name: string
  producer?: string
  grapeVarieties?: string[]
  country?: string
  region?: string
  vintage?: number
  alcohol?: number
  memo?: string
}

export type WineEvaluation = {
  id: string
  wineId: string
  evaluatorId: string
  evaluatedAt: string

  sweetness: number
  acidity: number
  tannin: number
  body: number
  alcohol: number
  fruitiness: number
  minerality: number
  finish: number

  aromaIntensity: number
  citrus: number
  stoneFruit: number
  tropical: number
  redFruit: number
  blackFruit: number
  driedFruit: number
  floral: number
  herbal: number
  green: number
  spice: number
  oak: number
  nutty: number
  earthy: number
  aged: number

  comment?: string

  tastingTemperature?: number
  decanting?: boolean
  memo?: string
}

export const RATING_CRITERION_IDS = [
  "sweetness",
  "acidity",
  "tannin",
  "body",
  "alcohol",
  "fruitiness",
  "minerality",
  "finish",
  "aromaIntensity",
  "citrus",
  "stoneFruit",
  "tropical",
  "redFruit",
  "blackFruit",
  "driedFruit",
  "floral",
  "herbal",
  "green",
  "spice",
  "oak",
  "nutty",
  "earthy",
  "aged",
] as const

export type RatingCriterionId = (typeof RATING_CRITERION_IDS)[number]

export type EvaluationVector = Record<RatingCriterionId, number>
