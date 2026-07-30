"use client"

import { useActionState } from "react"
import { RATING_CRITERIA } from "@/lib/rating-criteria"
import { RatingSlider } from "@/components/rating-slider"
import { Wine, WineEvaluation } from "@/lib/types"
import { fieldStyle, inputStyle, labelStyle } from "@/components/elements/form"
import { Button } from "@/components/elements/button"
import { Card } from "@/components/elements/card"

type Action = (
  prevState: { error?: string } | undefined,
  formData: FormData,
) => Promise<{ error?: string }>

export const EvaluationForm = ({
  action,
  wine,
  initialEvaluation,
}: {
  action: Action
  wine: Wine
  initialEvaluation?: WineEvaluation
}) => {
  const [state, formAction, pending] = useActionState(action, undefined)
  const tasteCriteria = RATING_CRITERIA.filter((c) => c.group === "taste")
  const aromaCriteria = RATING_CRITERIA.filter((c) => c.group === "aroma")

  return (
    <form action={formAction} style={{ display: "grid", gap: "1.75rem", maxWidth: 640 }}>
      <input type="hidden" name="wineId" value={wine.id} />

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

      {state?.error && (
        <p style={{ color: "#b3261e", fontSize: ".875rem" }}>{state.error}</p>
      )}

      <Button type="submit" disabled={pending} style={{ width: "fit-content" }}>
        {pending ? "保存中..." : "評価を保存"}
      </Button>
    </form>
  )
}
