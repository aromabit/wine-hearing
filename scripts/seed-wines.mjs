import { mkdir, readFile, writeFile } from "fs/promises"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const WINES_FILE = path.join(DATA_DIR, "wines.json")

const SEED_WINES = [
  {
    id: "seed-chateau-margaux",
    name: "シャトー・マルゴー",
    producer: "Château Margaux",
    grapeVarieties: ["カベルネ・ソーヴィニョン", "メルロ"],
    country: "フランス",
    region: "ボルドー（マルゴー）",
    vintage: 2015,
    alcohol: 13.5,
    memo: "ボルドー格付け第1級。優雅で緻密なタンニンが特徴の世界最高峰の赤ワイン。",
  },
  {
    id: "seed-romanee-conti",
    name: "ロマネ・コンティ",
    producer: "Domaine de la Romanée-Conti",
    grapeVarieties: ["ピノ・ノワール"],
    country: "フランス",
    region: "ブルゴーニュ（ヴォーヌ・ロマネ）",
    vintage: 2018,
    alcohol: 13,
    memo: "世界で最も稀少とされるグラン・クリュ。芳醇な香りと複雑な余韻。",
  },
  {
    id: "seed-dom-perignon",
    name: "ドン・ペリニヨン",
    producer: "Moët & Chandon",
    grapeVarieties: ["シャルドネ", "ピノ・ノワール"],
    country: "フランス",
    region: "シャンパーニュ",
    vintage: 2013,
    alcohol: 12.5,
    memo: "ヴィンテージ・シャンパーニュの代名詞。緻密な泡と厚みのある味わい。",
  },
  {
    id: "seed-opus-one",
    name: "オーパス・ワン",
    producer: "Opus One Winery",
    grapeVarieties: ["カベルネ・ソーヴィニョン", "メルロ"],
    country: "アメリカ",
    region: "ナパヴァレー",
    vintage: 2019,
    alcohol: 14.5,
    memo: "ボルドーとカリフォルニアの融合から生まれたプレミアムワインの代表格。",
  },
  {
    id: "seed-sassicaia",
    name: "サッシカイア",
    producer: "Tenuta San Guido",
    grapeVarieties: ["カベルネ・ソーヴィニョン", "カベルネ・フラン"],
    country: "イタリア",
    region: "トスカーナ（ボルゲリ）",
    vintage: 2019,
    alcohol: 14,
    memo: "スーパータスカンの先駆け。イタリアワインの常識を変えた一本。",
  },
  {
    id: "seed-penfolds-grange",
    name: "ペンフォールズ グランジ",
    producer: "Penfolds",
    grapeVarieties: ["シラーズ"],
    country: "オーストラリア",
    region: "サウスオーストラリア",
    vintage: 2018,
    alcohol: 14.5,
    memo: "オーストラリアを代表するアイコンワイン。力強く濃厚なシラーズ。",
  },
  {
    id: "seed-chateau-yquem",
    name: "シャトー・ディケム",
    producer: "Château d'Yquem",
    grapeVarieties: ["セミヨン", "ソーヴィニヨン・ブラン"],
    country: "フランス",
    region: "ボルドー（ソーテルヌ）",
    vintage: 2017,
    alcohol: 14,
    memo: "貴腐ワインの最高峰。濃密な甘みと蜂蜜香、長い熟成にも耐える。",
  },
  {
    id: "seed-vega-sicilia-unico",
    name: "ベガ・シシリア ウニコ",
    producer: "Vega Sicilia",
    grapeVarieties: ["テンプラニーリョ", "カベルネ・ソーヴィニョン"],
    country: "スペイン",
    region: "リベラ・デル・ドゥエロ",
    vintage: 2011,
    alcohol: 14,
    memo: "スペインワインの最高峰。長期熟成による複雑でエレガントな味わい。",
  },
  {
    id: "seed-yellow-tail-shiraz",
    name: "イエローテイル シラーズ",
    producer: "[yellow tail]",
    grapeVarieties: ["シラーズ"],
    country: "オーストラリア",
    region: "サウス・イースタン・オーストラリア",
    vintage: 2022,
    alcohol: 13.5,
    memo: "世界的ベストセラーの日常消費ワイン。果実味豊かで飲みやすい廉価帯の代表格。",
  },
  {
    id: "seed-jacobs-creek-classic",
    name: "ジェイコブス・クリーク クラシック シラーズ・カベルネ",
    producer: "Jacob's Creek",
    grapeVarieties: ["シラーズ", "カベルネ・ソーヴィニョン"],
    country: "オーストラリア",
    region: "サウス・イースタン・オーストラリア",
    vintage: 2022,
    alcohol: 13.5,
    memo: "スーパーの定番。手頃な価格帯でバランスの取れた味わい。",
  },
  {
    id: "seed-cono-sur-bicicleta-pinot",
    name: "コノスル ビシクレタ ピノ・ノワール",
    producer: "Cono Sur",
    grapeVarieties: ["ピノ・ノワール"],
    country: "チリ",
    region: "セントラル・ヴァレー",
    vintage: 2022,
    alcohol: 13,
    memo: "コストパフォーマンスの高さで有名なチリワイン。軽やかで果実味豊か。",
  },
  {
    id: "seed-carlo-rossi",
    name: "カルロ・ロッシ レッド",
    producer: "Carlo Rossi",
    grapeVarieties: ["ジンファンデル"],
    country: "アメリカ",
    region: "カリフォルニア",
    vintage: 2022,
    alcohol: 12,
    memo: "アメリカの家庭向け定番デイリーワイン。軽く飲みやすい。",
  },
  {
    id: "seed-santa-helena-gran-reserva",
    name: "サンタ・ヘレナ グラン・レゼルバ カベルネ・ソーヴィニョン",
    producer: "Santa Helena",
    grapeVarieties: ["カベルネ・ソーヴィニョン"],
    country: "チリ",
    region: "コルチャグア・ヴァレー",
    vintage: 2021,
    alcohol: 13.5,
    memo: "廉価帯でも安定した品質のチリ産カベルネ。しっかりした果実味。",
  },
]

async function main() {
  await mkdir(DATA_DIR, { recursive: true })

  let existing = []
  try {
    existing = JSON.parse(await readFile(WINES_FILE, "utf-8"))
  } catch (error) {
    if (error.code !== "ENOENT") throw error
  }

  const existingIds = new Set(existing.map((wine) => wine.id))
  const toAdd = SEED_WINES.filter((wine) => !existingIds.has(wine.id))

  if (toAdd.length === 0) {
    console.log("既に投入済みです。追加はありません。")
    return
  }

  await writeFile(
    WINES_FILE,
    JSON.stringify([...existing, ...toAdd], null, 2),
    "utf-8",
  )
  console.log(`${toAdd.length}件のワインを追加しました。`)
}

main()
