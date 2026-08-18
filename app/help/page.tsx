import { Card } from "@/components/elements/card"

const sectionStyle = { display: "grid", gap: ".9rem" }
const headingStyle = {
  fontFamily: "var(--font-serif)",
  fontSize: "1.05rem",
  fontWeight: 700,
  color: "var(--color-primary)",
  margin: 0,
}
const cardStyle = { padding: "1.25rem", display: "grid", gap: ".6rem" }
const mutedStyle = { color: "var(--color-text-muted)", fontSize: ".9rem" }

const HelpPage = () => {
  return (
    <div style={{ display: "grid", gap: "1.75rem", maxWidth: 640 }}>
      <div>
        <h1 style={{ ...headingStyle, fontSize: "1.3rem" }}>使い方</h1>
        <p style={mutedStyle}>
          Wine Hearing はソムリエの官能評価データを収集するアプリ。基本的な使い方はこちら。
        </p>
      </div>

      <Card style={cardStyle}>
        <h2 style={headingStyle}>1. 評価を登録する</h2>
        <p style={mutedStyle}>
          トップページの「新規評価」から入力画面へ。ワイン名は未入力でも登録日時が自動で入る。
        </p>
        <ul style={{ ...mutedStyle, paddingLeft: "1.2rem", display: "grid", gap: ".3rem" }}>
          <li>
            <strong>詳細入力</strong>：ワイン名・生産者・ブドウ品種・生産国/産地・ヴィンテージ・アルコール度数・ワインメモ（任意）
          </li>
          <li>
            <strong>写真</strong>：最大枚数まで追加可（リモートストレージ有効時のみ表示）
          </li>
          <li>
            <strong>味覚・構造</strong>：甘み・酸味・苦み・塩味・タンニン・渋み・アルコール感の7項目をスライダーで評価
          </li>
          <li>
            <strong>香り</strong>：香りの強さ・柑橘系・核果系・トロピカル系・赤果実系・黒果実系・フローラル・ハーブ／青さ・スパイス・ナッツ・土/森林/動物・樽香の12項目
          </li>
          <li>
            <strong>自由コメント</strong>：テイスティングの所感を自由記述
          </li>
        </ul>
        <p style={mutedStyle}>
          テキスト欄はマイクアイコンから音声入力できる（対応ブラウザのみ）。
        </p>
      </Card>

      <Card style={cardStyle}>
        <h2 style={headingStyle}>2. 評価を見る・編集する</h2>
        <p style={mutedStyle}>
          トップページの一覧からカードを選ぶと詳細を表示。詳細画面から編集・削除ができる。
        </p>
      </Card>

      <Card style={cardStyle}>
        <h2 style={headingStyle}>3. 評価マップ</h2>
        <p style={mutedStyle}>
          ヘッダーの「評価マップ」で登録済み評価をPCA（主成分分析）による散布図で俯瞰できる。近い位置にあるワインほど官能評価が似ている。
        </p>
      </Card>

      <Card style={cardStyle}>
        <h2 style={headingStyle}>4. ユーザー管理（管理者のみ）</h2>
        <p style={mutedStyle}>
          管理者モードのアカウントにはヘッダーに「ユーザー管理」が表示され、評価者アカウントの追加・編集ができる。
        </p>
      </Card>
    </div>
  )
}

export default HelpPage
