import { Card } from "@/components/elements/card"
import { InstallPwaSection } from "@/components/install-pwa-section"

const headingStyle = {
  fontFamily: "var(--font-serif)",
  fontSize: "1.05rem",
  fontWeight: 700,
  color: "var(--color-primary)",
  margin: 0,
}
const cardStyle = { padding: "1.25rem", display: "grid", gap: ".6rem" }
const mutedStyle = { color: "var(--color-text-muted)", fontSize: ".9rem" }

const SettingsPage = () => {
  return (
    <div style={{ display: "grid", gap: "1.75rem", maxWidth: 640 }}>
      <div>
        <h1 style={{ ...headingStyle, fontSize: "1.3rem" }}>設定</h1>
        <p style={mutedStyle}>アプリの各種設定はこちら。</p>
      </div>

      <Card style={cardStyle}>
        <h2 style={headingStyle}>ホーム画面に追加</h2>
        <p style={mutedStyle}>
          Wine Hearing をホーム画面に追加するとアプリのように起動できる。
        </p>
        <InstallPwaSection />
      </Card>
    </div>
  )
}

export default SettingsPage
