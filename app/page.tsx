import { FC } from "react"
import { LinkButton } from "@/components/elements/button"

const Page: FC = () => {
  return (
    <div style={{ display: "grid", gap: "1rem", textAlign: "center", padding: "3rem 0" }}>
      <div style={{ fontSize: "3rem" }}>🍷</div>
      <h2 style={{ margin: 0 }}>Wine Hearing</h2>
      <p style={{ color: "var(--color-text-muted)" }}>
        ソムリエによる23次元の官能評価を記録・蓄積します。
      </p>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <LinkButton href="/wines">ワイン一覧へ</LinkButton>
        <LinkButton href="/evaluations" variant="outline">
          評価一覧へ
        </LinkButton>
      </div>
    </div>
  )
}

export default Page
