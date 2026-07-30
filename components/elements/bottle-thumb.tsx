import { FC } from "react"

export const BottleThumb: FC<{ size?: number }> = ({ size = 56 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background:
        "radial-gradient(circle at 35% 30%, #d94f76, var(--color-primary) 70%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.5,
      flexShrink: 0,
    }}
  >
    🍷
  </div>
)
