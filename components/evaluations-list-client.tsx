"use client"

import Link from "next/link"
import { useEvaluations } from "@/lib/evaluation-store"
import { Card } from "@/components/elements/card"
import { BottleThumb } from "@/components/elements/bottle-thumb"
import { LinkButton } from "@/components/elements/button"
import { ExportEvaluationsButton } from "@/components/export-evaluations-button"
import { useAdminMode } from "@/lib/admin-mode"
import { useCurrentUserId } from "@/lib/current-user"
import { useUsers } from "@/lib/user-store"

export const EvaluationsListClient = () => {
  const { evaluations, loaded } = useEvaluations()
  const { isAdmin } = useAdminMode()
  const { users } = useUsers()
  const currentUserId = useCurrentUserId()
  const currentUserName = users.find((u) => u.id === currentUserId)?.name

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
            ))}
        </div>
      )}
    </div>
  )
}
