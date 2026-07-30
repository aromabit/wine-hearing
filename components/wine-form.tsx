"use client"

import { useActionState, useRef } from "react"
import { Wine } from "@/lib/types"
import { fieldStyle, inputStyle, labelStyle } from "@/components/elements/form"
import { Button } from "@/components/elements/button"
import { Card } from "@/components/elements/card"
import { JanLookup } from "@/components/jan-lookup"

type Action = (
  prevState: { error?: string } | undefined,
  formData: FormData,
) => Promise<{ error?: string }>

export const WineForm = ({
  action,
  initialWine,
}: {
  action: Action
  initialWine?: Wine
}) => {
  const [state, formAction, pending] = useActionState(action, undefined)
  const nameInputRef = useRef<HTMLInputElement>(null)

  return (
    <Card style={{ padding: "1.5rem", maxWidth: 480 }}>
      <form action={formAction} style={{ display: "grid", gap: "1.1rem" }}>
      <JanLookup
        onSelect={(name) => {
          if (nameInputRef.current) nameInputRef.current.value = name
        }}
      />
      <div style={fieldStyle}>
        <label htmlFor="name" style={labelStyle}>
          ワイン名 *
        </label>
        <input
          id="name"
          name="name"
          required
          ref={nameInputRef}
          defaultValue={initialWine?.name}
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
          defaultValue={initialWine?.producer}
          style={inputStyle}
        />
      </div>
      <div style={fieldStyle}>
        <label htmlFor="grapeVarieties" style={labelStyle}>
          品種（カンマ区切り）
        </label>
        <input
          id="grapeVarieties"
          name="grapeVarieties"
          defaultValue={initialWine?.grapeVarieties?.join(", ")}
          style={inputStyle}
        />
      </div>
      <div style={fieldStyle}>
        <label htmlFor="country" style={labelStyle}>
          国
        </label>
        <input
          id="country"
          name="country"
          defaultValue={initialWine?.country}
          style={inputStyle}
        />
      </div>
      <div style={fieldStyle}>
        <label htmlFor="region" style={labelStyle}>
          地域
        </label>
        <input
          id="region"
          name="region"
          defaultValue={initialWine?.region}
          style={inputStyle}
        />
      </div>
      <div style={fieldStyle}>
        <label htmlFor="vintage" style={labelStyle}>
          ヴィンテージ
        </label>
        <input
          id="vintage"
          name="vintage"
          type="number"
          defaultValue={initialWine?.vintage}
          style={inputStyle}
        />
      </div>
      <div style={fieldStyle}>
        <label htmlFor="alcohol" style={labelStyle}>
          アルコール度数（%）
        </label>
        <input
          id="alcohol"
          name="alcohol"
          type="number"
          step="0.1"
          defaultValue={initialWine?.alcohol}
          style={inputStyle}
        />
      </div>
      <div style={fieldStyle}>
        <label htmlFor="memo" style={labelStyle}>
          メモ
        </label>
        <textarea
          id="memo"
          name="memo"
          defaultValue={initialWine?.memo}
          style={{ ...inputStyle, minHeight: "4rem" }}
        />
      </div>

      {state?.error && (
        <p style={{ color: "#b3261e", fontSize: ".875rem" }}>{state.error}</p>
      )}

      <Button type="submit" disabled={pending} style={{ width: "fit-content" }}>
        {pending ? "保存中..." : "保存"}
      </Button>
      </form>
    </Card>
  )
}
