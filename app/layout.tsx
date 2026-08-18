import Link from "next/link"
import { Header } from "@/components/header"
import { SeedLocalEvaluations } from "@/components/seed-local-evaluations"
import { CurrentUserGate } from "@/components/current-user-gate"
import { AdminModeProvider } from "@/lib/admin-mode"
import "./reset.css"

export const metadata = {
  title: "Wine Hearing",
  description: "ソムリエ官能評価データ収集プラットフォーム",
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja">
      <body>
        <AdminModeProvider>
          <SeedLocalEvaluations />
          <CurrentUserGate>
            <Header />
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <p>&copy; ScentifAI</p>
              <Link
                href="/help"
                style={{ color: "var(--color-text-muted)" }}
              >
                使い方
              </Link>
            </footer>
          </CurrentUserGate>
        </AdminModeProvider>
      </body>
    </html>
  )
}
export default RootLayout
