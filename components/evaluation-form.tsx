"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { RATING_CRITERIA } from "@/lib/rating-criteria"
import { RatingSlider } from "@/components/rating-slider"
import { Wine, WineEvaluation } from "@/lib/types"
import { fieldStyle, inputStyle, labelStyle } from "@/components/elements/form"
import { Button } from "@/components/elements/button"
import { Card } from "@/components/elements/card"
import { validateEvaluationInput } from "@/lib/validate-evaluation"
import { saveLocalEvaluation } from "@/lib/local-evaluations"

export const EvaluationForm = ({
  wine,
  initialEvaluation,
}: {
  wine: Wine
  initialEvaluation?: WineEvaluation
}) => {
  const router = useRouter()
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)
  const tasteCriteria = RATING_CRITERIA.filter((c) => c.group === "taste")
  const aromaCriteria = RATING_CRITERIA.filter((c) => c.group === "aroma")

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(undefined)
    setPending(true)

    const formData = new FormData(e.currentTarget)
    const body: Record<string, unknown> = { wineId: wine.id }
    for (const criterion of RATING_CRITERIA) {
      body[criterion.id] = formData.get(criterion.id)
    }
    body.evaluatorId = formData.get("evaluatorId")
    body.comment = formData.get("comment") || undefined
    body.tastingTemperature = formData.get("tastingTemperature") || undefined
    body.decanting = formData.get("decanting") === "on"
    body.memo = formData.get("memo") || undefined

    const result = validateEvaluationInput(body)
    if ("error" in result) {
      setError(result.error)
      setPending(false)
      return
    }

    const evaluation: WineEvaluation = {
      id: initialEvaluation?.id ?? crypto.randomUUID(),
      wineId: wine.id,
      evaluatorId: body.evaluatorId as string,
      evaluatedAt: initialEvaluation?.evaluatedAt ?? new Date().toISOString(),
      ...result.vector,
      comment: (body.comment as string) || undefined,
      tastingTemperature: body.tastingTemperature
        ? Number(body.tastingTemperature)
        : undefined,
      decanting: body.decanting as boolean,
      memo: (body.memo as string) || undefined,
    }

    saveLocalEvaluation(evaluation)
    router.push(`/evaluations/detail?id=${evaluation.id}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "grid", gap: "1.75rem", maxWidth: 640 }}
    >
      <div>
        <h3 style={{ marginBottom: ".75rem" }}>味覚・構造</h3>
        <div style={{ display: "grid", gap: ".6rem" }}>
          {tasteCriteria.map((criterion) => (
            <RatingSlider
              key={criterion.id}
              criterion={criterion}
              defaultValue={initialEvaluation?.[criterion.id]}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: ".75rem" }}>香り</h3>
        <div style={{ display: "grid", gap: ".6rem" }}>
          {aromaCriteria.map((criterion) => (
            <RatingSlider
              key={criterion.id}
              criterion={criterion}
              defaultValue={initialEvaluation?.[criterion.id]}
            />
          ))}
        </div>
      </div>

      <div style={fieldStyle}>
        <label htmlFor="comment" style={labelStyle}>
          自由コメント
        </label>
        <textarea
          id="comment"
          name="comment"
          defaultValue={initialEvaluation?.comment}
          style={{ ...inputStyle, minHeight: "5rem" }}
          placeholder="酸味が美しく、タンニンは細かい。黒果実と樽香が調和している。"
        />
      </div>

      <Card style={{ padding: "1.25rem" }}>
        <h3 style={{ marginBottom: ".9rem" }}>テイスティング条件</h3>
        <div style={{ display: "grid", gap: ".9rem" }}>
          <div style={fieldStyle}>
            <label htmlFor="evaluatorId" style={labelStyle}>
              評価者ID *
            </label>
            <input
              id="evaluatorId"
              name="evaluatorId"
              required
              defaultValue={initialEvaluation?.evaluatorId}
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="tastingTemperature" style={labelStyle}>
              テイスティング温度（℃）
            </label>
            <input
              id="tastingTemperature"
              name="tastingTemperature"
              type="number"
              step="0.5"
              defaultValue={initialEvaluation?.tastingTemperature}
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            <input
              id="decanting"
              name="decanting"
              type="checkbox"
              defaultChecked={initialEvaluation?.decanting}
            />
            <label htmlFor="decanting" style={labelStyle}>
              デキャンタージュ有
            </label>
          </div>
          <div style={fieldStyle}>
            <label htmlFor="memo" style={labelStyle}>
              評価メモ
            </label>
            <textarea
              id="memo"
              name="memo"
              defaultValue={initialEvaluation?.memo}
              style={{ ...inputStyle, minHeight: "3rem" }}
            />
          </div>
        </div>
      </Card>

      {error && (
        <p style={{ color: "#b3261e", fontSize: ".875rem" }}>{error}</p>
      )}

      <Button type="submit" disabled={pending} style={{ width: "fit-content" }}>
        {pending ? "保存中..." : "評価を保存"}
      </Button>
    </form>
  )
}
