import Link from "next/link"
import { Title } from "@/components/elements/layout"
import { SeedLocalEvaluations } from "@/components/seed-local-evaluations"
import "./reset.css"

export const metadata = {
  title: "Wine Hearing",
  description: "ソムリエ官能評価データ収集プラットフォーム",
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja">
      <body>
        <SeedLocalEvaluations />
        <header
          style={{
            backgroundColor: "var(--color-surface)",
            borderBottom: "2px solid var(--color-gold)",
            boxShadow: "0 1px 3px rgba(43, 37, 35, 0.06)",
            padding: ".75rem 1.5rem",
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem 2rem",
            minHeight: "3.5rem",
          }}
        >
          <Title>
            <span style={{ marginRight: ".4rem" }}>🍷</span>
            Wine Hearing
          </Title>
          <nav
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: ".5rem 1.5rem",
              fontWeight: 600,
              fontSize: ".9rem",
            }}
          >
            <Link href="/evaluations" style={{ color: "var(--color-text)" }}>
              評価
            </Link>
            <Link href="/analysis" style={{ color: "var(--color-text)" }}>
              評価マップ
            </Link>
          </nav>
        </header>
        <main
          style={{
            minHeight: "calc(100dvh - 5.625rem)",
            padding: "1.5rem",
            maxWidth: "960px",
            margin: "0 auto",
          }}
        >
          {children}
        </main>
        <footer
          style={{
            borderTop: "1px solid var(--color-border)",
            color: "var(--color-text-muted)",
            fontSize: ".75rem",
            padding: "1rem 1.5rem",
          }}
        >
          <p>&copy; ScentifAI</p>
        </footer>
      </body>
    </html>
  )
}
export default RootLayout
