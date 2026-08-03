# Wine Sommelier Evaluation Platform 仕様書

## 1. 概要

ソムリエが指定されたワインを官能評価し、その結果を定量化して蓄積するWebアプリケーション。

収集した評価データは、将来的なワインレコメンドシステムの基礎データとして利用する。

本システムでは、ソムリエによる評価を23次元の数値ベクトルとして保存する。

### 目的

ソムリエが持つワインに関する知識・感覚を、

言語的な評価
→ 定量化
→ ベクトル化
→ データとして蓄積

することで、再利用可能な評価データセットを構築する。

---

## 2. 対象ユーザー

- ソムリエ
- ワインエキスパート
- 評価データ管理者

一般ユーザー向けのレコメンド機能は本システムの対象外とする。

---

## 3. 基本ワークフロー

1. 管理者が評価対象ワインを登録する
2. ソムリエが評価対象ワインを選択する
3. ソムリエが23項目を評価する
4. 必要に応じて自由コメントを入力する
5. 評価データを保存する
6. 保存済みデータを一覧・確認する
7. 評価データをCSV / JSONで出力する

---

## 4. ワイン管理

### 4.1 ワイン基本情報

以下の情報を管理する。

| 項目           | 必須 | 備考         |
| -------------- | ---- | ------------ |
| ワイン名       | ○    | 表示名       |
| 生産者         | -    | 生産者名     |
| 品種           | -    | 複数品種対応 |
| 国             | -    | 生産国       |
| 地域           | -    | 生産地域     |
| ヴィンテージ   | -    | 年           |
| アルコール度数 | -    | %            |
| メモ           | -    | 管理者メモ   |

---

## 5. 官能評価

評価値は原則として0〜10の11段階とする。

- 0: 全く感じない / 非常に低い
- 5: 中程度 / 標準的
- 10: 非常に強い / 非常に高い

必要に応じて0.5刻みで入力可能とする。

### 5.1 味覚・構造評価（8次元）

| ID         | 項目         | 低値       | 高値       |
| ---------- | ------------ | ---------- | ---------- |
| sweetness  | 甘味         | 完全辛口   | 極甘口     |
| acidity    | 酸味         | 非常に低い | 非常に高い |
| tannin     | タンニン     | 感じない   | 非常に強い |
| body       | ボディ       | ライト     | フル       |
| alcohol    | アルコール感 | 軽い       | 強い       |
| fruitiness | 果実味       | 控えめ     | 非常に豊か |
| minerality | ミネラル感   | 感じない   | 非常に強い |
| finish     | 余韻         | 短い       | 非常に長い |

### 5.2 香り評価（15次元）

| ID              | 項目             | 評価対象                     |
| --------------- | ---------------- | ---------------------------- |
| aroma_intensity | 香りの強さ       | 香り全体の強度               |
| citrus          | 柑橘系           | レモン、グレープフルーツ等   |
| stone_fruit     | 核果系           | 桃、杏等                     |
| tropical        | トロピカル系     | マンゴー、パイン等           |
| red_fruit       | 赤果実系         | いちご、チェリー等           |
| black_fruit     | 黒果実系         | カシス、ブラックベリー等     |
| dried_fruit     | ドライフルーツ系 | レーズン、プルーン等         |
| floral          | フローラル       | 花、バラ、スミレ等           |
| herbal          | ハーブ           | ミント、タイム等             |
| green           | 青さ             | 青草、ピーマン等             |
| spice           | スパイス         | 胡椒、クローブ等             |
| oak             | 樽香             | バニラ、トースト等           |
| nutty           | ナッツ           | アーモンド、ヘーゼルナッツ等 |
| earthy          | 土・森林         | 土、森林、きのこ等           |
| aged            | 熟成香           | 蜂蜜、熟成由来の香り等       |

---

## 6. 自由記述

数値評価だけでは表現できない情報を保存するため、自由コメントを入力できるようにする。

### 入力例

> 酸味が美しく、タンニンは細かい。黒果実と樽香が調和している。

自由記述は必須としない。

将来的な自然言語処理や評価理由の分析に利用できるよう、原文を変更せず保存する。

---

## 7. 評価メタデータ

評価単位で以下の情報を保存する。

| 項目               | 必須 | 備考       |
| ------------------ | ---- | ---------- |
| 評価者             | ○    | ソムリエID |
| 評価日時           | ○    | 自動記録   |
| テイスティング温度 | -    | ℃          |
| デキャンタージュ   | -    | 有 / 無    |
| 評価メモ           | -    | 補足情報   |

評価者情報と評価日時は自動的に記録する。

---

## 8. 評価入力画面

### 8.1 基本構成

画面上部に評価対象ワインの基本情報を表示する。

その下に以下のセクションを配置する。

1. 味覚・構造
2. 香り
3. 自由コメント
4. テイスティング条件
5. 保存

### 8.2 入力UI

数値評価はスライダーまたはステップ入力を基本とする。

例：

```text
酸味

0 ───────●────── 10
          7
```

入力値を数値として明示する。

### 8.3 入力補助

各評価項目について、

- 項目名
- 評価の意味
- 0の状態
- 5の状態
- 10の状態

を表示し、評価者間の基準を統一する。

---

## 9. 評価一覧

保存済み評価を一覧表示する。

### 表示項目

- ワイン名
- 生産者
- ヴィンテージ
- 評価者
- 評価日時
- 評価ステータス

### 操作

- 詳細表示
- 編集
- 削除
- CSV出力
- JSON出力

---

## 10. 評価詳細

1件の評価について以下を確認できる。

- ワイン基本情報
- 23次元評価
- レーダーチャート等による評価値の可視化
- 自由コメント
- 評価メタデータ

---

## 11. データ出力

### 11.1 CSV

1評価を1行として出力する。

例：

```csv
wine_id,wine_name,evaluator_id,sweetness,acidity,tannin,body,alcohol,fruitiness,minerality,finish,aroma_intensity,citrus,stone_fruit,tropical,red_fruit,black_fruit,dried_fruit,floral,herbal,green,spice,oak,nutty,earthy,aged
```

### 11.2 JSON

評価を構造化されたJSONとして出力する。

例：

```json
{
  "wine_id": "wine_001",
  "evaluator_id": "sommelier_001",
  "evaluation": {
    "sweetness": 2,
    "acidity": 7,
    "tannin": 5,
    "body": 6,
    "alcohol": 6,
    "fruitiness": 8,
    "minerality": 7,
    "finish": 8,
    "aroma_intensity": 8,
    "citrus": 6,
    "stone_fruit": 3,
    "tropical": 1,
    "red_fruit": 7,
    "black_fruit": 5,
    "dried_fruit": 1,
    "floral": 4,
    "herbal": 2,
    "green": 1,
    "spice": 4,
    "oak": 5,
    "nutty": 2,
    "earthy": 1,
    "aged": 2
  },
  "comment": "酸味が美しく、タンニンは細かい。"
}
```

---

## 12. データモデル

ワインは独立したオブジェクトを持たず、評価（WineEvaluation）作成時にワイン情報を直接入力する。

### WineEvaluation

```ts
type WineEvaluation = {
  id: string
  evaluatorId: string
  evaluatedAt: string

  wineName: string
  producer?: string
  grapeVarieties?: string[]
  country?: string
  region?: string
  vintage?: number
  wineAlcoholPercent?: number
  wineMemo?: string

  sweetness: number
  acidity: number
  tannin: number
  body: number
  alcohol: number
  fruitiness: number
  minerality: number
  finish: number

  aromaIntensity: number
  citrus: number
  stoneFruit: number
  tropical: number
  redFruit: number
  blackFruit: number
  driedFruit: number
  floral: number
  herbal: number
  green: number
  spice: number
  oak: number
  nutty: number
  earthy: number
  aged: number

  comment?: string

  tastingTemperature?: number
  decanting?: boolean
  memo?: string
}
```

---

## 13. ベクトルデータ

23次元の評価値は、分析・検索で利用できるよう1つのベクトルとして扱える構造にする。

```text
[
  sweetness,
  acidity,
  tannin,
  body,
  alcohol,
  fruitiness,
  minerality,
  finish,
  aromaIntensity,
  citrus,
  stoneFruit,
  tropical,
  redFruit,
  blackFruit,
  driedFruit,
  floral,
  herbal,
  green,
  spice,
  oak,
  nutty,
  earthy,
  aged
]
```

ベクトルの各次元の順序はシステム全体で固定する。

---

## 14. 評価基準の管理

評価基準はコードに直接埋め込まず、将来的に変更可能な構造とする。

各項目について以下を管理できるようにする。

- ID
- 表示名
- 説明
- 最小値
- 最大値
- 中央値の説明
- 単位
- 表示順
- 有効 / 無効

評価基準を変更した場合でも、過去の評価データの意味が変わらないよう、評価基準のバージョンを管理する。

---

## 15. 評価の再現性

同一ワインを複数のソムリエが評価できるようにする。

1つのワインに対して複数の `WineEvaluation` を保持する。

```text
Wine
 ├─ Evaluation A
 ├─ Evaluation B
 └─ Evaluation C
```

評価者ごとのデータを上書きせず、独立した評価として保存する。

これにより、将来的に評価者間のばらつきを確認できるデータ構造とする。

---

## 16. データ品質

入力時に以下を検証する。

- 数値が0〜10の範囲内であること
- 必須項目が入力されていること
- ワインが存在すること
- 評価者が存在すること
- 評価基準バージョンが存在すること

異常値や欠損値を自動的に補正せず、原データを保持する。

---

## 17. 非機能要件

### 操作性

ソムリエがテイスティング中に短時間で入力できること。

### レスポンシブ

PC・タブレットで利用可能とする。

スマートフォンでも最低限の入力ができること。

### データ保持

評価データは削除操作を除き、意図せず上書きされないこと。

### エクスポート

CSV / JSONをいつでも出力できること。

---

## 18. MVPの範囲

MVPでは以下を実装する。

### 評価

- 評価作成時にワイン情報を入力
- 味覚・香り評価入力
- コメント入力
- 評価保存
- 評価編集
- 評価一覧
- 評価詳細

### 出力

- CSV出力
- JSON出力

### 認証

- ソムリエ / 管理者のログイン
- 権限による操作制御

---

## 19. MVPでは実装しないもの

以下はデータ収集後のフェーズとする。

- ワインレコメンド
- ユーザー向け質問フォーム
- PCA
- UMAP
- クラスタリング
- 類似ワイン検索
- ワインマップ
- LLMによる推薦理由生成
- ユーザー嗜好ベクトル
- 購入履歴との連携

本システムでは、これらの機能を実装するための高品質な評価データを収集することを優先する。

---

## 20. データ保存構成

評価データは AWS Lambda (Function URL) 経由で S3 上の単一 JSON (`evaluations.json`) に保存する。

- デプロイ手順・運用: [`DEPLOY.md`](./DEPLOY.md)
- API 仕様: [`api/README.md`](./api/README.md)
- フロントは API を正とし、LocalStorage は表示高速化とオフライン閲覧のためのキャッシュとして利用する
- `NEXT_PUBLIC_EVALUATIONS_API_URL` が未設定の場合は LocalStorage のみで動作する（[`.env.example`](./.env.example) 参照）
