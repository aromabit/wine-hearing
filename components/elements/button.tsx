import Link from "next/link"
import { ComponentProps, CSSProperties, FC } from "react"

const base: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: ".4rem",
  borderRadius: 999,
  fontWeight: 700,
  fontSize: ".875rem",
  padding: ".55rem 1.25rem",
  border: "1px solid transparent",
  transition: "opacity .15s",
}

const variants = {
  primary: {
    background: "var(--color-primary)",
    color: "#fff",
  },
  outline: {
    background: "transparent",
    color: "var(--color-primary)",
    borderColor: "var(--color-primary)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text-muted)",
  },
  danger: {
    background: "transparent",
    color: "#b3261e",
  },
} satisfies Record<string, CSSProperties>

type Variant = keyof typeof variants

export const LinkButton: FC<
  ComponentProps<typeof Link> & { variant?: Variant }
> = ({ variant = "primary", style, children, ...props }) => (
  <Link
    style={{ ...base, ...variants[variant], textDecoration: "none", ...style }}
    {...props}
  >
    {children}
  </Link>
)

export const Button: FC<
  ComponentProps<"button"> & { variant?: Variant }
> = ({ variant = "primary", style, children, ...props }) => (
  <button style={{ ...base, ...variants[variant], ...style }} {...props}>
    {children}
  </button>
)
