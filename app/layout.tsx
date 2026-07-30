import Link from "next/link"
import { Title } from "@/components/elements/layout"
import "./reset.css"

export const metadata = {
  title: "Wine Sommelier Evaluation Platform",
  description: "ソムリエ官能評価データ収集プラットフォーム",
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja">
      <body>
        <header
          style={{
            backgroundColor: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
            padding: "0 1.5rem",
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            height: "3.5rem",
          }}
        >
          <Title>
            <span style={{ marginRight: ".4rem" }}>🍷</span>
            Wine Sommelier
          </Title>
          <nav
            style={{
              display: "flex",
              gap: "1.5rem",
              fontWeight: 600,
              fontSize: ".9rem",
            }}
          >
            <Link href="/wines" style={{ color: "var(--color-text)" }}>
              ワイン
            </Link>
            <Link href="/evaluations" style={{ color: "var(--color-text)" }}>
              評価
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
