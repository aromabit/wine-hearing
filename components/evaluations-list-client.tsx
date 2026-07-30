"use client"

import Link from "next/link"
import { useLocalEvaluations } from "@/lib/use-local-evaluations"
import { Wine } from "@/lib/types"
import { Card } from "@/components/elements/card"
import { BottleThumb } from "@/components/elements/bottle-thumb"
import { ExportEvaluationsButton } from "@/components/export-evaluations-button"

export const EvaluationsListClient = ({ wines }: { wines: Wine[] }) => {
  const { evaluations, loaded } = useLocalEvaluations()
  const wineNameById = new Map(wines.map((wine) => [wine.id, wine.name]))

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          gap: "1rem",
        }}
      >
        <h2 style={{ margin: 0 }}>評価一覧</h2>
        <ExportEvaluationsButton />
      </div>
      {!loaded ? null : evaluations.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)" }}>
          評価データはまだありません。ワイン詳細ページから評価を追加できます。
        </p>
      ) : (
        <div style={{ display: "grid", gap: ".6rem" }}>
          {evaluations
            .slice()
            .sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt))
            .map((evaluation) => (
              <Link
                key={evaluation.id}
                href={`/evaluations/detail?id=${evaluation.id}`}
              >
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
