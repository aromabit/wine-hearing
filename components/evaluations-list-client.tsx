"use client"

import Link from "next/link"
import { useState } from "react"
import { useEvaluations } from "@/lib/evaluation-store"
import { Card } from "@/components/elements/card"
import { EvaluationImage } from "@/components/evaluation-image"
import { BottleThumb } from "@/components/elements/bottle-thumb"
import { LinkButton } from "@/components/elements/button"
import { ExportEvaluationsButton } from "@/components/export-evaluations-button"
import { useAdminMode } from "@/lib/admin-mode"
import { useCurrentUserId } from "@/lib/current-user"
import { useUsers } from "@/lib/user-store"
import { isRemoteStorageEnabled } from "@/lib/evaluation-api"
import { missingParts } from "@/lib/evaluation-status"

export const EvaluationsListClient = () => {
  const { evaluations, loaded } = useEvaluations()
  const { isAdmin } = useAdminMode()
  const { users } = useUsers()
  const currentUserId = useCurrentUserId()
  const currentUserName = users.find((u) => u.id === currentUserId)?.name
  const [expandedImage, setExpandedImage] = useState<{
    evaluationId: string
    imageId: string
  }>()

  // 管理者以外は自分が評価者の項目のみ表示する。
  const visibleEvaluations = isAdmin
    ? evaluations
    : evaluations.filter((evaluation) => evaluation.evaluatorId === currentUserName)

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
        <div style={{ display: "flex", gap: ".5rem" }}>
          {isAdmin && <ExportEvaluationsButton />}
          <LinkButton href="/evaluations/new">+ 評価を追加</LinkButton>
        </div>
      </div>
      {!loaded ? null : visibleEvaluations.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)" }}>
          評価データはまだありません。「+ 評価を追加」から評価を登録できます。
        </p>
      ) : (
        <div style={{ display: "grid", gap: ".6rem" }}>
          {visibleEvaluations
            .slice()
            .sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt))
            .map((evaluation) => {
              const missing = missingParts(evaluation, {
                includeImage: isRemoteStorageEnabled,
              })
              const totalParts = isRemoteStorageEnabled ? 3 : 2
              // 進捗3段階: 未着手(グレー) / 一部記入(ゴールド) / 記入済み(ワイン色)
              const progressColor =
                missing.length === 0
                  ? "var(--color-primary)"
                  : missing.length === totalParts
                    ? "var(--color-border)"
                    : "var(--color-gold)"
              return (
                <Link
                  key={evaluation.id}
                  href={`/evaluations/detail?id=${evaluation.id}`}
                >
                  <Card
                    title={
                      missing.length > 0
                        ? `未記入: ${missing.join("・")}`
                        : "官能・コメント・画像 記入済み"
                    }
                    style={{
                      padding: ".5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: ".9rem",
                      borderLeft: `8px solid ${progressColor}`,
                      background: `color-mix(in srgb, ${progressColor} 8%, var(--color-surface))`,
                    }}
                  >
                    {(() => {
                      const thumbImageId = isRemoteStorageEnabled
                        ? evaluation.imageIds?.[0]
                        : undefined
                      const thumb = (
                        <BottleThumb
                          size={64}
                          evaluationId={
                            isRemoteStorageEnabled ? evaluation.id : undefined
                          }
                          imageId={thumbImageId}
                        />
                      )
                      if (!thumbImageId) return thumb
                      return (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setExpandedImage({
                              evaluationId: evaluation.id,
                              imageId: thumbImageId,
                            })
                          }}
                          aria-label="写真を拡大表示"
                          style={{
                            padding: 0,
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          {thumb}
                        </button>
                      )
                    })()}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: "var(--color-text)" }}>
                        {evaluation.wineName || "(ワイン名未登録)"}
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
              )
            })}
        </div>
      )}

      {expandedImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setExpandedImage(undefined)}
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
            evaluationId={expandedImage.evaluationId}
            imageId={expandedImage.imageId}
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
    </div>
  )
}
