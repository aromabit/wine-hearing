import Link from "next/link"
import { Header } from "@/components/header"
import { SeedLocalEvaluations } from "@/components/seed-local-evaluations"
import { CurrentUserGate } from "@/components/current-user-gate"
import { RegisterServiceWorker } from "@/components/register-service-worker"
import { AdminModeProvider } from "@/lib/admin-mode"
import "./reset.css"

const basePath = process.env.NODE_ENV === "production" ? "/wine-hearing" : ""

export const metadata = {
  title: "Wine Hearing",
  description: "ソムリエ官能評価データ収集プラットフォーム",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wine Hearing",
  },
  icons: {
    icon: [
      { url: `${basePath}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${basePath}/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: `${basePath}/apple-touch-icon.png`,
  },
}

export const viewport = {
  themeColor: "#a6093d",
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja">
      <body>
        <AdminModeProvider>
          <RegisterServiceWorker />
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
              <div style={{ display: "flex", gap: "1rem" }}>
                <Link
                  href="/help"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  使い方
                </Link>
              </div>
            </footer>
          </CurrentUserGate>
        </AdminModeProvider>
      </body>
    </html>
  )
}
export default RootLayout
