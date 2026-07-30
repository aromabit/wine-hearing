import { RATING_CRITERIA } from "@/lib/rating-criteria"
import { WineEvaluation } from "@/lib/types"
import { Card } from "@/components/elements/card"

export const EvaluationVectorChart = ({
  evaluation,
}: {
  evaluation: WineEvaluation
}) => {
  const groups = [
    { title: "味覚・構造", group: "taste" as const },
    { title: "香り", group: "aroma" as const },
  ]

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {groups.map(({ title, group }) => (
        <Card key={group} style={{ padding: "1.25rem" }}>
          <h3 style={{ marginBottom: ".75rem" }}>{title}</h3>
          <div style={{ display: "grid", gap: ".55rem" }}>
            {RATING_CRITERIA.filter((c) => c.group === group).map((criterion) => {
              const value = evaluation[criterion.id]
              const percent = ((value - criterion.min) / (criterion.max - criterion.min)) * 100
              return (
                <div key={criterion.id} style={{ display: "grid", gap: ".2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".875rem" }}>
                    <span style={{ fontWeight: 600 }}>{criterion.label}</span>
                    <span style={{ color: "var(--color-text-muted)" }}>{value}</span>
                  </div>
                  <div
                    style={{
                      background: "var(--color-bg)",
                      borderRadius: 999,
                      height: ".5rem",
                    }}
                  >
                    <div
                      style={{
                        width: `${percent}%`,
                        background:
                          group === "taste"
                            ? "var(--color-primary)"
                            : "var(--color-gold)",
                        height: "100%",
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      ))}
    </div>
  )
}
