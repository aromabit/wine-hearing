import { FC } from "react"
import { EvaluationImage } from "@/components/evaluation-image"

export const BottleThumb: FC<{
  size?: number
  evaluationId?: string
  imageId?: string
}> = ({ size = 56, evaluationId, imageId }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background:
        "radial-gradient(circle at 35% 30%, #d94f76, var(--color-primary) 70%)",
      border: "1px solid var(--color-gold)",
      boxShadow: "0 2px 6px rgba(43, 37, 35, 0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.5,
      flexShrink: 0,
      overflow: "hidden",
    }}
  >
    {evaluationId && imageId ? (
      <EvaluationImage
        evaluationId={evaluationId}
        imageId={imageId}
        style={{ width: size, height: size, borderRadius: "50%" }}
      />
    ) : (
      "🍷"
    )}
  </div>
)
