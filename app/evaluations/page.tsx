import Link from "next/link"
import { listEvaluations, listWines } from "@/lib/db"
import { Card } from "@/components/elements/card"
import { BottleThumb } from "@/components/elements/bottle-thumb"

const EvaluationsPage = async () => {
  const [evaluations, wines] = await Promise.all([
    listEvaluations(),
    listWines(),
  ])
  const wineNameById = new Map(wines.map((wine) => [wine.id, wine.name]))

  return (
    <div>
      <h2 style={{ marginBottom: "1.5rem" }}>評価一覧</h2>
      {evaluations.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)" }}>
          評価データはまだありません。
        </p>
      ) : (
        <div style={{ display: "grid", gap: ".6rem" }}>
          {evaluations
            .slice()
            .sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt))
            .map((evaluation) => (
              <Link key={evaluation.id} href={`/evaluations/${evaluation.id}`}>
                <Card
                  style={{
                    padding: "1rem 1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: ".9rem",
                  }}
                >
                  <BottleThumb size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "var(--color-text)" }}>
                      {wineNameById.get(evaluation.wineId) || "(削除済みワイン)"}
                    </div>
                    <div
                      style={{
                        fontSize: ".8rem",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {evaluation.evaluatorId} —{" "}
                      {new Date(evaluation.evaluatedAt).toLocaleString("ja-JP")}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
        </div>
      )}
    </div>
  )
}

export default EvaluationsPage
