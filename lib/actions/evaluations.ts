"use server"

import { randomUUID } from "crypto"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import {
  deleteEvaluation as deleteEvaluationFromDb,
  getEvaluation,
  getWine,
  saveEvaluation,
} from "@/lib/db"
import { RATING_CRITERIA } from "@/lib/rating-criteria"
import { validateEvaluationInput } from "@/lib/validate-evaluation"
import { WineEvaluation } from "@/lib/types"

function formDataToRecord(formData: FormData): Record<string, unknown> {
  const record: Record<string, unknown> = {}
  for (const criterion of RATING_CRITERIA) {
    record[criterion.id] = formData.get(criterion.id)
  }
  record.wineId = formData.get("wineId")
  record.evaluatorId = formData.get("evaluatorId")
  record.comment = formData.get("comment") || undefined
  record.tastingTemperature = formData.get("tastingTemperature") || undefined
  record.decanting = formData.get("decanting") === "on"
  record.memo = formData.get("memo") || undefined
  return record
}

export async function createEvaluation(
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const body = formDataToRecord(formData)

  const wineId = body.wineId
  if (!wineId || typeof wineId !== "string") {
    return { error: "wineId は必須です" }
  }
  const wine = await getWine(wineId)
  if (!wine) {
    return { error: "指定されたワインが存在しません" }
  }

  const result = validateEvaluationInput(body)
  if ("error" in result) return { error: result.error }

  const evaluation: WineEvaluation = {
    id: randomUUID(),
    wineId,
    evaluatorId: body.evaluatorId as string,
    evaluatedAt: new Date().toISOString(),
    ...result.vector,
    comment: (body.comment as string) || undefined,
    tastingTemperature: body.tastingTemperature
      ? Number(body.tastingTemperature)
      : undefined,
    decanting: body.decanting as boolean,
    memo: (body.memo as string) || undefined,
  }

  await saveEvaluation(evaluation)
  revalidatePath("/evaluations")
  revalidatePath(`/wines/${wineId}`)
  redirect(`/evaluations/${evaluation.id}`)
}

export async function updateEvaluation(
  id: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const existing = await getEvaluation(id)
  if (!existing) return { error: "評価が見つかりません" }

  const body = formDataToRecord(formData)
  const wineId = (body.wineId as string) || existing.wineId
  const wine = await getWine(wineId)
  if (!wine) {
    return { error: "指定されたワインが存在しません" }
  }

  const result = validateEvaluationInput(body)
  if ("error" in result) return { error: result.error }

  const evaluation: WineEvaluation = {
    ...existing,
    wineId,
    evaluatorId: (body.evaluatorId as string) || existing.evaluatorId,
    ...result.vector,
    comment: (body.comment as string) || undefined,
    tastingTemperature: body.tastingTemperature
      ? Number(body.tastingTemperature)
      : undefined,
    decanting: body.decanting as boolean,
    memo: (body.memo as string) || undefined,
  }

  await saveEvaluation(evaluation)
  revalidatePath("/evaluations")
  revalidatePath(`/evaluations/${id}`)
  revalidatePath(`/wines/${wineId}`)
  redirect(`/evaluations/${id}`)
}

export async function deleteEvaluationAction(id: string) {
  const existing = await getEvaluation(id)
  if (!existing) return
  await deleteEvaluationFromDb(id)
  revalidatePath("/evaluations")
  revalidatePath(`/wines/${existing.wineId}`)
  redirect("/evaluations")
}
