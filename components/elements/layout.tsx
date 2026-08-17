import { ComponentProps, FC } from "react"

export const Title: FC<ComponentProps<"h1">> = ({
  style,
  children,
  ...props
}) => (
  <h1
    style={{
      fontFamily: "var(--font-serif)",
      fontSize: "1.05rem",
      fontWeight: 700,
      letterSpacing: ".02em",
      color: "var(--color-primary)",
      margin: 0,
      display: "flex",
      alignItems: "center",
      ...style,
    }}
    {...props}
  >
    {children}
  </h1>
)
