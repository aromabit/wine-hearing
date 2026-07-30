import Link from "next/link"
import { notFound } from "next/navigation"
import { getEvaluation, getWine } from "@/lib/db"
import { EvaluationVectorChart } from "@/components/evaluation-vector-chart"
import { DeleteEvaluationButton } from "@/components/delete-evaluation-button"
import { Card } from "@/components/elements/card"
import { LinkButton } from "@/components/elements/button"

const EvaluationDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  const evaluation = await getEvaluation(id)
  if (!evaluation) notFound()

  const wine = await getWine(evaluation.wineId)

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
            {wine ? <Link href={`/wines/${wine.id}`}>{wine.name}</Link> : "(削除済みワイン)"}
            {" の評価"}
          </h2>
          <div style={{ display: "flex", gap: ".5rem", flexShrink: 0 }}>
            <LinkButton href={`/evaluations/${evaluation.id}/edit`} variant="outline">
              編集
            </LinkButton>
            <DeleteEvaluationButton evaluationId={evaluation.id} />
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
          <dd>{evaluation.tastingTemperature != null ? `${evaluation.tastingTemperature}℃` : "-"}</dd>
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

export default EvaluationDetailPage
