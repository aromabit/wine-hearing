import { CSSProperties } from "react"

export const fieldStyle: CSSProperties = { display: "grid", gap: ".3rem" }

export const labelStyle: CSSProperties = {
  fontSize: ".8rem",
  fontWeight: 600,
  color: "var(--color-text-muted)",
}

export const inputStyle: CSSProperties = {
  padding: ".6rem .75rem",
  background: "var(--color-surface)",
  color: "var(--color-text)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
}
