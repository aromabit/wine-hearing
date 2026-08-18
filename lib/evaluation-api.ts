import { WineEvaluation } from "./types"

const BASE_URL = (process.env.NEXT_PUBLIC_EVALUATIONS_API_URL ?? "").replace(
  /\/+$/,
  ""
)
const API_KEY = process.env.NEXT_PUBLIC_EVALUATIONS_API_KEY ?? ""

export const isRemoteStorageEnabled = BASE_URL !== ""

async function request(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-api-key": API_KEY,
      ...init?.headers,
    },
  })
  if (!response.ok) {
    const message = await response.text().catch(() => "")
    throw new Error(`API ${response.status}: ${message || response.statusText}`)
  }
  return response
}

export async function fetchRemoteEvaluations(): Promise<WineEvaluation[]> {
  const response = await request("/evaluations")
  const body = (await response.json()) as { evaluations?: WineEvaluation[] }
  return body.evaluations ?? []
}

export async function putRemoteEvaluation(
  evaluation: WineEvaluation
): Promise<void> {
  await request(`/evaluations/${encodeURIComponent(evaluation.id)}`, {
    method: "PUT",
    body: JSON.stringify(evaluation),
  })
}

export async function deleteRemoteEvaluation(id: string): Promise<void> {
  await request(`/evaluations/${encodeURIComponent(id)}`, { method: "DELETE" })
}

function imagePath(evaluationId: string, imageId: string): string {
  return `/evaluations/${encodeURIComponent(evaluationId)}/images/${encodeURIComponent(imageId)}`
}

export async function putRemoteEvaluationImage(
  evaluationId: string,
  imageId: string,
  file: Blob
): Promise<void> {
  await request(imagePath(evaluationId, imageId), {
    method: "PUT",
    headers: { "content-type": file.type },
    body: file,
  })
}

export async function deleteRemoteEvaluationImage(
  evaluationId: string,
  imageId: string
): Promise<void> {
  await request(imagePath(evaluationId, imageId), { method: "DELETE" })
}

export async function fetchRemoteEvaluationImage(
  evaluationId: string,
  imageId: string
): Promise<Blob> {
  const response = await request(imagePath(evaluationId, imageId))
  return response.blob()
}
