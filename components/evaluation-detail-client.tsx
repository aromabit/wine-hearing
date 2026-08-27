"use client"

import Link from "next/link"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useEvaluation } from "@/lib/evaluation-store"
import { EvaluationVectorChart } from "@/components/evaluation-vector-chart"
import { EvaluationImage } from "@/components/evaluation-image"
import { Card, Tag } from "@/components/elements/card"
import { LinkButton } from "@/components/elements/button"

export const EvaluationDetailClient = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const { evaluation, loaded } = useEvaluation(id)
  const [expandedImageId, setExpandedImageId] = useState<string>()

  if (!loaded) return null

  if (!evaluation) {
    return (
      <div>
        <h2>評価が見つかりません</h2>
        <p>
          <Link href="/">評価一覧</Link> に戻ってください。
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <Card style={{ padding: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
          }}
        >
          <h2 style={{ margin: 0 }}>
            {evaluation.wineName || "(ワイン名未登録)"}
          </h2>
          <div style={{ display: "flex", gap: ".5rem", flexShrink: 0 }}>
            <LinkButton
              href={`/evaluations/new?editId=${evaluation.id}`}
              variant="outline"
            >
              編集
            </LinkButton>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: ".5rem",
            flexWrap: "wrap",
            marginTop: ".75rem",
          }}
        >
          {evaluation.vintage && <Tag>{evaluation.vintage}</Tag>}
          {evaluation.wineAlcoholPercent != null && (
            <Tag>{evaluation.wineAlcoholPercent}%</Tag>
          )}
          {evaluation.grapeVarieties?.map((v) => (
            <Tag key={v}>{v}</Tag>
          ))}
        </div>
        <p
          style={{
            color: "var(--color-text-muted)",
            marginTop: ".5rem",
            fontSize: ".9rem",
          }}
        >
          {[evaluation.producer, evaluation.region, evaluation.country]
            .filter(Boolean)
            .join(" / ") || "ワイン情報未登録"}
        </p>
        {evaluation.wineMemo && (
          <p style={{ marginTop: ".5rem", fontSize: ".9rem" }}>
            {evaluation.wineMemo}
          </p>
        )}

        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "8rem 1fr",
            gap: ".3rem 1rem",
            marginTop: "1rem",
            fontSize: ".9rem",
          }}
        >
          <dt style={{ color: "var(--color-text-muted)" }}>評価者</dt>
          <dd>
            {evaluation.evaluatorId} #{evaluation.number}
          </dd>
          <dt style={{ color: "var(--color-text-muted)" }}>評価日時</dt>
          <dd>{new Date(evaluation.evaluatedAt).toLocaleString("ja-JP")}</dd>
        </dl>
      </Card>

      {evaluation.imageIds && evaluation.imageIds.length > 0 && (
        <Card style={{ padding: "1.25rem" }}>
          <h3 style={{ marginBottom: ".75rem" }}>写真</h3>
          <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
            {evaluation.imageIds.map((imageId) => (
              <button
                key={imageId}
                type="button"
                onClick={() => setExpandedImageId(imageId)}
                aria-label="写真を拡大表示"
                style={{
                  padding: 0,
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                <EvaluationImage
                  evaluationId={evaluation.id}
                  imageId={imageId}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                  }}
                />
              </button>
            ))}
          </div>
        </Card>
      )}

      {expandedImageId && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setExpandedImageId(undefined)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 1000,
            cursor: "zoom-out",
          }}
        >
          <EvaluationImage
            evaluationId={evaluation.id}
            imageId={expandedImageId}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        </div>
      )}

      <EvaluationVectorChart evaluation={evaluation} />

      <Card style={{ padding: "1.25rem" }}>
        <h3 style={{ marginBottom: ".5rem" }}>自由コメント</h3>
        <p>{evaluation.comment || "（なし）"}</p>
      </Card>
    </div>
  )
}
