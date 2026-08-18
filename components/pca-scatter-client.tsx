"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useEvaluations } from "@/lib/evaluation-store"
import { isSensoryComplete } from "@/lib/evaluation-status"
import { RATING_CRITERIA } from "@/lib/rating-criteria"
import { computePca2D, PcaPoint, standardize } from "@/lib/pca"
import { kMeans } from "@/lib/kmeans"
import { Card } from "@/components/elements/card"
import { Button } from "@/components/elements/button"

const WIDTH = 640
const HEIGHT = 480
const PADDING = 32

// dataviz skillの検証済みカテゴリカルパレット（散布図の全ペア比較で色覚安全なのは先頭3色まで）
const CLUSTER_COLORS = ["#2a78d6", "#eb6834", "#1baf7a"]
const CLUSTER_LABELS = ["クラスタ 1", "クラスタ 2", "クラスタ 3"]
const CLUSTER_OPTIONS = [2, 3]

export const PcaScatterClient = () => {
  const { evaluations, loaded } = useEvaluations()
  const [view, setView] = useState<"scatter" | "table">("scatter")
  const [clusterCount, setClusterCount] = useState(3)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const { points, clusters } = useMemo(() => {
    // 官能情報が未記入の評価は数値ベクトルを持たないためPCA対象から除外する。
    const scored = evaluations.filter(isSensoryComplete)
    if (scored.length < 2) return { points: [], clusters: [] as number[] }
    const matrix = scored.map((evaluation) =>
      RATING_CRITERIA.map((criterion) => evaluation[criterion.id] as number),
    )
    let raw: PcaPoint[]
    try {
      raw = computePca2D(matrix)
    } catch {
      return { points: [], clusters: [] as number[] }
    }
    const clusterAssignments = kMeans(standardize(matrix), clusterCount)
    return {
      points: raw.map((point, i) => ({ ...point, evaluation: scored[i] })),
      clusters: clusterAssignments,
    }
  }, [evaluations, clusterCount])

  if (!loaded) return null

  if (points.length < 2) {
    return (
      <div>
        <h2 style={{ marginBottom: "1rem" }}>評価マップ（PCA）</h2>
        <p style={{ color: "var(--color-text-muted)" }}>
          主成分分析には官能情報が記入済みの評価データが2件以上必要です。現在
          {points.length}件です。
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
  const effectiveClusterCount = Math.min(clusterCount, points.length)

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>評価マップ（PCA）</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: ".85rem", marginTop: ".3rem" }}>
            23次元の評価ベクトルを主成分分析で2次元に圧縮し、k-meansでクラスタ分けして味わいの近さを俯瞰します。
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: ".75rem",
          marginBottom: "1rem",
        }}
      >
        <span style={{ fontSize: ".85rem", color: "var(--color-text-muted)" }}>
          クラスタ数
        </span>
        {CLUSTER_OPTIONS.map((count) => (
          <Button
            key={count}
            type="button"
            variant={clusterCount === count ? "primary" : "outline"}
            onClick={() => setClusterCount(count)}
            style={{ padding: ".3rem .8rem" }}
          >
            {count}
          </Button>
        ))}
        <div style={{ display: "flex", gap: "1rem", marginLeft: "1rem" }}>
          {Array.from({ length: effectiveClusterCount }, (_, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: ".35rem" }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: CLUSTER_COLORS[i],
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: ".8rem", color: "var(--color-text-muted)" }}>
                {CLUSTER_LABELS[i]}
              </span>
            </div>
          ))}
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

            {points.map((point, i) => {
              const isHovered = point.evaluation.id === hoveredId
              const cx = toSvgX(point.x)
              const cy = toSvgY(point.y)
              return (
                <g key={point.evaluation.id}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 8 : 6}
                    fill={CLUSTER_COLORS[clusters[i]] ?? CLUSTER_COLORS[0]}
                    stroke="var(--color-surface)"
                    strokeWidth={2}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredId(point.evaluation.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  />
                  <text
                    x={cx + 9}
                    y={cy + 3}
                    fontSize={10}
                    fill="var(--color-text-muted)"
                    pointerEvents="none"
                  >
                    {point.evaluation.wineName || "(ワイン名未登録)"}
                  </text>
                </g>
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
                  borderRadius: 2,
                  boxShadow: "var(--shadow)",
                  padding: ".6rem .8rem",
                  fontSize: ".8rem",
                  pointerEvents: "none",
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  {hovered.evaluation.wineName || "(ワイン名未登録)"}
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
                <th style={{ padding: ".5rem" }}>クラスタ</th>
                <th style={{ padding: ".5rem", textAlign: "right" }}>PC1</th>
                <th style={{ padding: ".5rem", textAlign: "right" }}>PC2</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point, i) => (
                <tr
                  key={point.evaluation.id}
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  <td style={{ padding: ".5rem" }}>
                    <Link href={`/evaluations/detail?id=${point.evaluation.id}`}>
                      {point.evaluation.wineName || "(ワイン名未登録)"}
                    </Link>
                  </td>
                  <td style={{ padding: ".5rem" }}>{point.evaluation.evaluatorId}</td>
                  <td style={{ padding: ".5rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: ".4rem",
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background:
                            CLUSTER_COLORS[clusters[i]] ?? CLUSTER_COLORS[0],
                          display: "inline-block",
                        }}
                      />
                      {CLUSTER_LABELS[clusters[i]] ?? CLUSTER_LABELS[0]}
                    </span>
                  </td>
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
