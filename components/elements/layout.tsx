import { ComponentProps, FC } from "react"

export const Title: FC<ComponentProps<"h1">> = ({
  style,
  children,
  ...props
}) => (
  <h1
    style={{
      fontSize: "1.15rem",
      fontWeight: 800,
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
