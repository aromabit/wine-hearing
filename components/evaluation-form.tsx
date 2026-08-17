"use client"

import { FormEvent, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { RATING_CRITERIA } from "@/lib/rating-criteria"
import { RatingSlider } from "@/components/rating-slider"
import { WineEvaluation } from "@/lib/types"
import { fieldStyle, inputStyle, labelStyle } from "@/components/elements/form"
import { Button } from "@/components/elements/button"
import { Card } from "@/components/elements/card"
import { SpeechTextarea } from "@/components/elements/speech-textarea"
import { validateEvaluationInput } from "@/lib/validate-evaluation"
import { saveEvaluation } from "@/lib/evaluation-store"
import { useUsers } from "@/lib/user-store"

export const EvaluationForm = ({
  initialEvaluation,
}: {
  initialEvaluation?: WineEvaluation
}) => {
  const router = useRouter()
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)
  const tasteCriteria = RATING_CRITERIA.filter((c) => c.group === "taste")
  const aromaCriteria = RATING_CRITERIA.filter((c) => c.group === "aroma")
  const { users } = useUsers()
  const evaluatorNames = useMemo(() => {
    const names = users.map((u) => u.name)
    const current = initialEvaluation?.evaluatorId
    return current && !names.includes(current) ? [current, ...names] : names
  }, [users, initialEvaluation?.evaluatorId])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(undefined)
    setPending(true)

    const formData = new FormData(e.currentTarget)
    const body: Record<string, unknown> = {}
    for (const criterion of RATING_CRITERIA) {
      body[criterion.id] = formData.get(criterion.id)
    }
    body.wineName = formData.get("wineName")
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

    const grapeVarietiesRaw = formData.get("grapeVarieties")
    const grapeVarieties =
      typeof grapeVarietiesRaw === "string" && grapeVarietiesRaw.trim() !== ""
        ? grapeVarietiesRaw
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean)
        : undefined
    const vintageRaw = formData.get("vintage")
    const wineAlcoholPercentRaw = formData.get("wineAlcoholPercent")

    const evaluation: WineEvaluation = {
      id: initialEvaluation?.id ?? crypto.randomUUID(),
      wineName: body.wineName as string,
      producer: (formData.get("producer") as string) || undefined,
      grapeVarieties,
      country: (formData.get("country") as string) || undefined,
      region: (formData.get("region") as string) || undefined,
      vintage: vintageRaw ? Number(vintageRaw) : undefined,
      wineAlcoholPercent: wineAlcoholPercentRaw
        ? Number(wineAlcoholPercentRaw)
        : undefined,
      wineMemo: (formData.get("wineMemo") as string) || undefined,
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

    try {
      await saveEvaluation(evaluation)
    } catch (saveError) {
      console.error("failed to save the evaluation", saveError)
      setError("保存に失敗しました。通信環境を確認してもう一度お試しください。")
      setPending(false)
      return
    }

    router.push(`/evaluations/detail?id=${evaluation.id}`)
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      style={{ display: "grid", gap: "1.75rem", maxWidth: 640 }}
    >
      <Card style={{ padding: "1.25rem" }}>
        <h3 style={{ marginBottom: ".9rem" }}>ワイン情報</h3>
        <div style={{ display: "grid", gap: ".9rem" }}>
          <div style={fieldStyle}>
            <label htmlFor="wineName" style={labelStyle}>
              ワイン名 *
            </label>
            <input
              id="wineName"
              name="wineName"
              required
              defaultValue={initialEvaluation?.wineName}
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="producer" style={labelStyle}>
              生産者
            </label>
            <input
              id="producer"
              name="producer"
              defaultValue={initialEvaluation?.producer}
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="grapeVarieties" style={labelStyle}>
              ブドウ品種（カンマ区切り）
            </label>
            <input
              id="grapeVarieties"
              name="grapeVarieties"
              defaultValue={initialEvaluation?.grapeVarieties?.join(", ")}
              placeholder="カベルネ・ソーヴィニョン, メルロ"
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", gap: ".9rem" }}>
            <div style={{ ...fieldStyle, flex: 1 }}>
              <label htmlFor="country" style={labelStyle}>
                生産国
              </label>
              <input
                id="country"
                name="country"
                defaultValue={initialEvaluation?.country}
                style={inputStyle}
              />
            </div>
            <div style={{ ...fieldStyle, flex: 1 }}>
              <label htmlFor="region" style={labelStyle}>
                産地
              </label>
              <input
                id="region"
                name="region"
                defaultValue={initialEvaluation?.region}
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: ".9rem" }}>
            <div style={{ ...fieldStyle, flex: 1 }}>
              <label htmlFor="vintage" style={labelStyle}>
                ヴィンテージ
              </label>
              <input
                id="vintage"
                name="vintage"
                type="number"
                defaultValue={initialEvaluation?.vintage}
                style={inputStyle}
              />
            </div>
            <div style={{ ...fieldStyle, flex: 1 }}>
              <label htmlFor="wineAlcoholPercent" style={labelStyle}>
                アルコール度数（%）
              </label>
              <input
                id="wineAlcoholPercent"
                name="wineAlcoholPercent"
                type="number"
                step="0.1"
                defaultValue={initialEvaluation?.wineAlcoholPercent}
                style={inputStyle}
              />
            </div>
          </div>
          <div style={fieldStyle}>
            <label htmlFor="wineMemo" style={labelStyle}>
              ワインメモ
            </label>
            <SpeechTextarea
              id="wineMemo"
              name="wineMemo"
              defaultValue={initialEvaluation?.wineMemo}
              style={{ minHeight: "3rem" }}
            />
          </div>
        </div>
      </Card>

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
        <SpeechTextarea
          id="comment"
          name="comment"
          defaultValue={initialEvaluation?.comment}
          style={{ minHeight: "5rem" }}
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
            {evaluatorNames.length === 0 ? (
              <p style={{ fontSize: ".85rem", color: "var(--color-text-muted)" }}>
                ユーザーが未登録です。
                <Link href="/users">ユーザー管理</Link>
                （管理者モード）から追加してください。
              </p>
            ) : (
              <select
                id="evaluatorId"
                name="evaluatorId"
                required
                defaultValue={initialEvaluation?.evaluatorId ?? ""}
                style={inputStyle}
              >
                <option value="" disabled>
                  選択してください
                </option>
                {evaluatorNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}
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
            <SpeechTextarea
              id="memo"
              name="memo"
              defaultValue={initialEvaluation?.memo}
              style={{ minHeight: "3rem" }}
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
