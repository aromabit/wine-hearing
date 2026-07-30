import Link from "next/link"
import { listWines } from "@/lib/db"
import { Card, Tag } from "@/components/elements/card"
import { BottleThumb } from "@/components/elements/bottle-thumb"
import { LinkButton } from "@/components/elements/button"

const WinesPage = async () => {
  const wines = await listWines()

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ margin: 0 }}>ワイン一覧</h2>
        <LinkButton href="/wines/new">+ ワイン登録</LinkButton>
      </div>

      {wines.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)" }}>
          登録されたワインはありません。
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1rem",
          }}
        >
          {wines.map((wine) => (
            <Link key={wine.id} href={`/wines/${wine.id}`}>
              <Card
                style={{
                  padding: "1.1rem",
                  display: "flex",
                  gap: ".9rem",
                  height: "100%",
                }}
              >
                <BottleThumb />
                <div style={{ display: "grid", gap: ".3rem", minWidth: 0 }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color: "var(--color-text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {wine.name}
                  </span>
                  <span
                    style={{
                      fontSize: ".8rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {[wine.producer, wine.region, wine.country]
                      .filter(Boolean)
                      .join(" / ") || "情報未登録"}
                  </span>
                  {wine.vintage && (
                    <Tag style={{ width: "fit-content" }}>{wine.vintage}</Tag>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default WinesPage
