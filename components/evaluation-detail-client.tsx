"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Wine } from "@/lib/types"
import { deleteLocalEvaluation } from "@/lib/local-evaluations"
import { useLocalEvaluation } from "@/lib/use-local-evaluations"
import { EvaluationVectorChart } from "@/components/evaluation-vector-chart"
import { Card } from "@/components/elements/card"
import { Button, LinkButton } from "@/components/elements/button"

export const EvaluationDetailClient = ({ wines }: { wines: Wine[] }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get("id")
  const { evaluation, loaded } = useLocalEvaluation(id)

  if (!loaded) return null

  if (!evaluation) {
    return (
      <div>
        <h2>評価が見つかりません</h2>
        <p>
          <Link href="/evaluations">評価一覧</Link> に戻ってください。
        </p>
      </div>
    )
  }

  const wine = wines.find((w) => w.id === evaluation.wineId)

  const handleDelete = () => {
    if (!confirm("この評価を削除しますか？")) return
    deleteLocalEvaluation(evaluation.id)
    router.push("/evaluations")
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
            {wine ? <Link href={`/wines/${wine.id}`}>{wine.name}</Link> : "(不明なワイン)"}
            {" の評価"}
          </h2>
          <div style={{ display: "flex", gap: ".5rem", flexShrink: 0 }}>
            <LinkButton
              href={`/evaluations/new?wineId=${evaluation.wineId}&editId=${evaluation.id}`}
              variant="outline"
            >
              編集
            </LinkButton>
            <Button type="button" variant="danger" onClick={handleDelete}>
              削除
            </Button>
          </div>
        </div>

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
          <dd>{evaluation.evaluatorId}</dd>
          <dt style={{ color: "var(--color-text-muted)" }}>評価日時</dt>
          <dd>{new Date(evaluation.evaluatedAt).toLocaleString("ja-JP")}</dd>
          <dt style={{ color: "var(--color-text-muted)" }}>テイスティング温度</dt>
          <dd>
            {evaluation.tastingTemperature != null
              ? `${evaluation.tastingTemperature}℃`
              : "-"}
          </dd>
          <dt style={{ color: "var(--color-text-muted)" }}>デキャンタージュ</dt>
          <dd>{evaluation.decanting ? "有" : "無"}</dd>
          <dt style={{ color: "var(--color-text-muted)" }}>評価メモ</dt>
          <dd>{evaluation.memo || "-"}</dd>
        </dl>
      </Card>

      <EvaluationVectorChart evaluation={evaluation} />

      <Card style={{ padding: "1.25rem" }}>
        <h3 style={{ marginBottom: ".5rem" }}>自由コメント</h3>
        <p>{evaluation.comment || "（なし）"}</p>
      </Card>
    </div>
  )
}
