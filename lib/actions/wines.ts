"use server"

import { randomUUID } from "crypto"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { deleteWine as deleteWineFromDb, saveWine } from "@/lib/db"
import { Wine } from "@/lib/types"

function buildWine(id: string, formData: FormData): Wine | { error: string } {
  const name = formData.get("name")
  if (!name || typeof name !== "string" || name.trim() === "") {
    return { error: "ワイン名は必須です" }
  }

  const grapeVarietiesRaw = formData.get("grapeVarieties")
  const grapeVarieties =
    typeof grapeVarietiesRaw === "string" && grapeVarietiesRaw.trim() !== ""
      ? grapeVarietiesRaw
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : undefined

  const vintageRaw = formData.get("vintage")
  const alcoholRaw = formData.get("alcohol")

  return {
    id,
    name: name.trim(),
    producer: (formData.get("producer") as string) || undefined,
    grapeVarieties,
    country: (formData.get("country") as string) || undefined,
    region: (formData.get("region") as string) || undefined,
    vintage: vintageRaw ? Number(vintageRaw) : undefined,
    alcohol: alcoholRaw ? Number(alcoholRaw) : undefined,
    memo: (formData.get("memo") as string) || undefined,
  }
}

export async function createWine(
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const wine = buildWine(randomUUID(), formData)
  if ("error" in wine) return wine

  await saveWine(wine)
  revalidatePath("/wines")
  redirect(`/wines/${wine.id}`)
}

export async function updateWine(
  id: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const wine = buildWine(id, formData)
  if ("error" in wine) return wine

  await saveWine(wine)
  revalidatePath("/wines")
  revalidatePath(`/wines/${id}`)
  redirect(`/wines/${id}`)
}

export async function deleteWineAction(id: string) {
  await deleteWineFromDb(id)
  revalidatePath("/wines")
  redirect("/wines")
}
