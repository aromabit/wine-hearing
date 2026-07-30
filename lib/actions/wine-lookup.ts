"use server"

import { RakutenWineCandidate, searchWineByJan } from "@/lib/rakuten"

const JAN_PATTERN = /^\d{8}$|^\d{13}$/

export async function lookupWineByJan(
  jan: string,
): Promise<{ candidates: RakutenWineCandidate[] } | { error: string }> {
  const trimmed = jan.trim()
  if (!JAN_PATTERN.test(trimmed)) {
    return { error: "JANコードは8桁または13桁の数字で入力してください" }
  }

  try {
    const candidates = await searchWineByJan(trimmed)
    if (candidates.length === 0) {
      return { error: "該当する商品が見つかりませんでした" }
    }
    return { candidates }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "検索に失敗しました",
    }
  }
}
