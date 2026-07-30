"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useLocalEvaluations } from "@/lib/use-local-evaluations"
import { RATING_CRITERIA } from "@/lib/rating-criteria"
import { computePca2D, PcaPoint } from "@/lib/pca"
import { Wine } from "@/lib/types"
import { Card } from "@/components/elements/card"
import { Button } from "@/components/elements/button"

const WIDTH = 640
const HEIGHT = 480
const PADDING = 32

export const PcaScatterClient = ({ wines }: { wines: Wine[] }) => {
  const { evaluations, loaded } = useLocalEvaluations()
  const [view, setView] = useState<"scatter" | "table">("scatter")
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const wineNameById = new Map(wines.map((wine) => [wine.id, wine.name]))

  const points = useMemo(() => {
    if (evaluations.length < 2) return []
    const matrix = evaluations.map((evaluation) =>
      RATING_CRITERIA.map((criterion) => evaluation[criterion.id]),
    )
    let raw: PcaPoint[]
    try {
      raw = computePca2D(matrix)
    } catch {
      return []
    }
    return raw.map((point, i) => ({ ...point, evaluation: evaluations[i] }))
  }, [evaluations])

  if (!loaded) return null

  if (evaluations.length < 2) {
    return (
      <div>
        <h2 style={{ marginBottom: "1rem" }}>評価マップ（PCA）</h2>
        <p style={{ color: "var(--color-text-muted)" }}>
          主成分分析には評価データが2件以上必要です。現在
          {evaluations.length}件登録されています。
        </p>
      </div>
    )
  }

  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const xMin = Math.min(...xs)
  const xMax = Math.max(...xs)
  const yMin = Math.min(...ys)
  const yMax = Math.max(...ys)
  const xRange = xMax - xMin || 1
  const yRange = yMax - yMin || 1

  const toSvgX = (x: number) =>
    PADDING + ((x - xMin) / xRange) * (WIDTH - PADDING * 2)
  const toSvgY = (y: number) =>
    HEIGHT - PADDING - ((y - yMin) / yRange) * (HEIGHT - PADDING * 2)

  const hovered = points.find((p) => p.evaluation.id === hoveredId)

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>評価マップ（PCA）</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: ".85rem", marginTop: ".3rem" }}>
            23次元の評価ベクトルを主成分分析で2次元に圧縮し、味わいの近さを俯瞰します。
          </p>
        </div>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <Button
            type="button"
            variant={view === "scatter" ? "primary" : "outline"}
            onClick={() => setView("scatter")}
          >
            散布図
          </Button>
          <Button
            type="button"
            variant={view === "table" ? "primary" : "outline"}
            onClick={() => setView("table")}
          >
            テーブル
          </Button>
        </div>
      </div>

      {view === "scatter" ? (
        <Card style={{ padding: "1.25rem", position: "relative" }}>
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            <line
              x1={PADDING}
              y1={HEIGHT / 2}
              x2={WIDTH - PADDING}
              y2={HEIGHT / 2}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
            <line
              x1={WIDTH / 2}
              y1={PADDING}
              x2={WIDTH / 2}
              y2={HEIGHT - PADDING}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
            <text
              x={WIDTH - PADDING}
              y={HEIGHT / 2 - 8}
              textAnchor="end"
              fontSize={11}
              fill="var(--color-text-muted)"
            >
              PC1
            </text>
            <text
              x={WIDTH / 2 + 8}
              y={PADDING + 10}
              fontSize={11}
              fill="var(--color-text-muted)"
            >
              PC2
            </text>

            {points.map((point) => {
              const isHovered = point.evaluation.id === hoveredId
              return (
                <circle
                  key={point.evaluation.id}
                  cx={toSvgX(point.x)}
                  cy={toSvgY(point.y)}
                  r={isHovered ? 8 : 6}
                  fill="var(--color-primary)"
                  stroke="var(--color-surface)"
                  strokeWidth={2}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredId(point.evaluation.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              )
            })}
          </svg>

          {hovered && (
            <Link href={`/evaluations/detail?id=${hovered.evaluation.id}`}>
              <div
                style={{
                  position: "absolute",
                  left: "1.25rem",
                  top: "1.25rem",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  boxShadow: "var(--shadow)",
                  padding: ".6rem .8rem",
                  fontSize: ".8rem",
                  pointerEvents: "none",
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  {wineNameById.get(hovered.evaluation.wineId) || "(削除済みワイン)"}
                </div>
                <div style={{ color: "var(--color-text-muted)" }}>
                  {hovered.evaluation.evaluatorId}
                </div>
              </div>
            </Link>
          )}
        </Card>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
                <th style={{ padding: ".5rem" }}>ワイン</th>
                <th style={{ padding: ".5rem" }}>評価者</th>
                <th style={{ padding: ".5rem", textAlign: "right" }}>PC1</th>
                <th style={{ padding: ".5rem", textAlign: "right" }}>PC2</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr
                  key={point.evaluation.id}
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  <td style={{ padding: ".5rem" }}>
                    <Link href={`/evaluations/detail?id=${point.evaluation.id}`}>
                      {wineNameById.get(point.evaluation.wineId) || "(削除済みワイン)"}
                    </Link>
                  </td>
                  <td style={{ padding: ".5rem" }}>{point.evaluation.evaluatorId}</td>
                  <td style={{ padding: ".5rem", textAlign: "right" }}>
                    {point.x.toFixed(2)}
                  </td>
                  <td style={{ padding: ".5rem", textAlign: "right" }}>
                    {point.y.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
