const ITEM_SEARCH_ENDPOINT =
  "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601"

export type RakutenWineCandidate = {
  itemName: string
  itemPrice: number
  itemUrl: string
  imageUrl?: string
  shopName: string
}

type RakutenSearchResponse = {
  Items?: {
    Item: {
      itemName: string
      itemPrice: number
      itemUrl: string
      shopName: string
      mediumImageUrls?: { imageUrl: string }[]
    }
  }[]
  error?: string
  error_description?: string
}

export async function searchWineByJan(
  jan: string,
): Promise<RakutenWineCandidate[]> {
  const applicationId = process.env.RAKUTEN_APP_ID
  if (!applicationId) {
    throw new Error(
      "RAKUTEN_APP_ID が設定されていません。楽天ウェブサービスでアプリIDを発行し .env.local に設定してください。",
    )
  }

  const params = new URLSearchParams({
    applicationId,
    keyword: jan,
    hits: "10",
    format: "json",
  })

  const response = await fetch(`${ITEM_SEARCH_ENDPOINT}?${params.toString()}`)
  const body = (await response.json()) as RakutenSearchResponse

  if (!response.ok || body.error) {
    throw new Error(body.error_description || "楽天APIの呼び出しに失敗しました")
  }

  return (body.Items || []).map(({ Item }) => ({
    itemName: Item.itemName,
    itemPrice: Item.itemPrice,
    itemUrl: Item.itemUrl,
    imageUrl: Item.mediumImageUrls?.[0]?.imageUrl,
    shopName: Item.shopName,
  }))
}
