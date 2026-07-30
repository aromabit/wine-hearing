"use client"

import Link from "next/link"
import { useLocalEvaluationsByWine } from "@/lib/use-local-evaluations"
import { Card } from "@/components/elements/card"
import { LinkButton } from "@/components/elements/button"

export const WineEvaluationsClient = ({ wineId }: { wineId: string }) => {
  const { evaluations, loaded } = useLocalEvaluationsByWine(wineId)

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: ".75rem",
        }}
      >
        <h3 style={{ margin: 0 }}>
          このワインの評価{loaded ? `（${evaluations.length}件）` : ""}
        </h3>
        <LinkButton href={`/evaluations/new?wineId=${wineId}`}>
          + 評価を追加
        </LinkButton>
      </div>
      {!loaded ? null : evaluations.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)" }}>
          まだ評価がありません。評価はこのブラウザ内（LocalStorage）に保存されます。
        </p>
      ) : (
        <div style={{ display: "grid", gap: ".6rem" }}>
          {evaluations.map((evaluation) => (
            <Link
              key={evaluation.id}
              href={`/evaluations/detail?id=${evaluation.id}`}
            >
              <Card
                style={{
                  padding: "1rem 1.25rem",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontWeight: 700 }}>{evaluation.evaluatorId}</span>
                <span style={{ color: "var(--color-text-muted)" }}>
                  {new Date(evaluation.evaluatedAt).toLocaleString("ja-JP")}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
