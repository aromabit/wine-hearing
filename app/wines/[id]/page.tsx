import { notFound } from "next/navigation"
import { getWine, listWines } from "@/lib/db"
import { Card, Tag } from "@/components/elements/card"
import { BottleThumb } from "@/components/elements/bottle-thumb"
import { WineEvaluationsClient } from "@/components/wine-evaluations-client"

export async function generateStaticParams() {
  const wines = await listWines()
  return wines.map((wine) => ({ id: wine.id }))
}

const WineDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  const wine = await getWine(id)
  if (!wine) notFound()

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <Card style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1.25rem" }}>
          <BottleThumb size={80} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0 }}>{wine.name}</h2>
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

      <WineEvaluationsClient wineId={wine.id} />
    </div>
  )
}

export default WineDetailPage
