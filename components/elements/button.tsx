import Link from "next/link"
import { ComponentProps, CSSProperties, FC } from "react"

const base: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: ".4rem",
  borderRadius: 2,
  fontWeight: 700,
  fontSize: ".8rem",
  letterSpacing: ".02em",
  padding: ".6rem 1.4rem",
  border: "1px solid transparent",
  transition: "opacity .15s, box-shadow .15s, transform .15s",
}

const variants = {
  primary: {
    background:
      "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(166, 9, 61, 0.28)",
  },
  outline: {
    background: "transparent",
    color: "var(--color-primary)",
    border: "1px solid var(--color-primary)",
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
