import Link from "next/link"
import { notFound } from "next/navigation"
import { getWine, listEvaluations } from "@/lib/db"
import { DeleteWineButton } from "@/components/delete-wine-button"
import { Card, Tag } from "@/components/elements/card"
import { BottleThumb } from "@/components/elements/bottle-thumb"
import { LinkButton } from "@/components/elements/button"

const WineDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  const wine = await getWine(id)
  if (!wine) notFound()

  const evaluations = (await listEvaluations()).filter(
    (evaluation) => evaluation.wineId === id,
  )

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <Card style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1.25rem" }}>
          <BottleThumb size={80} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "1rem",
              }}
            >
              <h2 style={{ margin: 0 }}>{wine.name}</h2>
              <div style={{ display: "flex", gap: ".5rem", flexShrink: 0 }}>
                <LinkButton href={`/wines/${wine.id}/edit`} variant="outline">
                  編集
                </LinkButton>
                <DeleteWineButton wineId={wine.id} />
              </div>
            </div>
            <p
              style={{
                color: "var(--color-text-muted)",
                margin: ".3rem 0 .7rem",
              }}
            >
              {[wine.producer, wine.region, wine.country]
                .filter(Boolean)
                .join(" / ") || "情報未登録"}
            </p>
            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
              {wine.vintage && <Tag>{wine.vintage}</Tag>}
              {wine.alcohol != null && <Tag>{wine.alcohol}%</Tag>}
              {wine.grapeVarieties?.map((v) => <Tag key={v}>{v}</Tag>)}
            </div>
            {wine.memo && (
              <p style={{ marginTop: ".75rem", fontSize: ".9rem" }}>
                {wine.memo}
              </p>
            )}
          </div>
        </div>
      </Card>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: ".75rem",
          }}
        >
          <h3 style={{ margin: 0 }}>このワインの評価（{evaluations.length}件）</h3>
          <LinkButton href={`/evaluations/new?wineId=${wine.id}`}>
            + 評価を追加
          </LinkButton>
        </div>
        {evaluations.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>
            まだ評価がありません。
          </p>
        ) : (
          <div style={{ display: "grid", gap: ".6rem" }}>
            {evaluations.map((evaluation) => (
              <Link key={evaluation.id} href={`/evaluations/${evaluation.id}`}>
                <Card
                  style={{
                    padding: "1rem 1.25rem",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontWeight: 700 }}>
                    {evaluation.evaluatorId}
                  </span>
                  <span style={{ color: "var(--color-text-muted)" }}>
                    {new Date(evaluation.evaluatedAt).toLocaleString("ja-JP")}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default WineDetailPage
