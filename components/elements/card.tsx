import { ComponentProps, FC } from "react"

export const Card: FC<ComponentProps<"div">> = ({ style, ...props }) => (
  <div
    style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius)",
      boxShadow: "var(--shadow)",
      ...style,
    }}
    {...props}
  />
)

export const Tag: FC<ComponentProps<"span">> = ({ style, ...props }) => (
  <span
    style={{
      display: "inline-block",
      background: "var(--color-bg)",
      color: "var(--color-text-muted)",
      border: "1px solid var(--color-border)",
      borderRadius: 999,
      fontSize: ".75rem",
      fontWeight: 600,
      padding: ".15rem .6rem",
      ...style,
    }}
    {...props}
  />
)
