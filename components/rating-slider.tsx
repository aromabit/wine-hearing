"use client"

import { useState } from "react"
import { RatingCriterion } from "@/lib/rating-criteria"
import { Card } from "@/components/elements/card"

export const RatingSlider = ({
  criterion,
  defaultValue,
}: {
  criterion: RatingCriterion
  defaultValue?: number
}) => {
  const [value, setValue] = useState(defaultValue ?? Math.round((criterion.min + criterion.max) / 2))
  // 新規作成時（defaultValueなし）はスライダー未操作の間、官能値を未記入扱いにする。
  const [touched, setTouched] = useState(defaultValue !== undefined)

  return (
    <Card style={{ padding: "1rem 1.1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <label htmlFor={criterion.id} style={{ fontWeight: 700 }}>
          {criterion.label}
        </label>
        <span
          style={{
            fontWeight: 800,
            color: touched ? "var(--color-primary)" : "var(--color-text-muted)",
            fontSize: "1.1rem",
          }}
        >
          {touched ? value : "未入力"}
        </span>
      </div>
      <p
        style={{
          fontSize: ".8rem",
          color: "var(--color-text-muted)",
          margin: ".2rem 0 .6rem",
        }}
      >
        {criterion.description}
      </p>
      <input
        id={criterion.id}
        name={touched ? criterion.id : undefined}
        type="range"
        min={criterion.min}
        max={criterion.max}
        step={criterion.step}
        value={value}
        onChange={(e) => {
          setValue(Number(e.target.value))
          setTouched(true)
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: ".75rem",
          color: "var(--color-text-muted)",
          marginTop: ".4rem",
        }}
      >
        <span>{criterion.min}: {criterion.low}</span>
        <span>{(criterion.min + criterion.max) / 2}: {criterion.mid}</span>
        <span>{criterion.max}: {criterion.high}</span>
      </div>
    </Card>
  )
}
