import { mkdir, readFile, writeFile } from "fs/promises"
import path from "path"
import { Wine, WineEvaluation } from "./types"

const DATA_DIR = path.join(process.cwd(), "data")
const WINES_FILE = path.join(DATA_DIR, "wines.json")
const EVALUATIONS_FILE = path.join(DATA_DIR, "evaluations.json")

async function readJsonFile<T>(file: string): Promise<T[]> {
  try {
    const raw = await readFile(file, "utf-8")
    return JSON.parse(raw) as T[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return []
    throw error
  }
}

async function writeJsonFile<T>(file: string, data: T[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(file, JSON.stringify(data, null, 2), "utf-8")
}

export async function listWines(): Promise<Wine[]> {
  return readJsonFile<Wine>(WINES_FILE)
}

export async function getWine(id: string): Promise<Wine | undefined> {
  const wines = await listWines()
  return wines.find((wine) => wine.id === id)
}

export async function saveWine(wine: Wine): Promise<void> {
  const wines = await listWines()
  const index = wines.findIndex((w) => w.id === wine.id)
  if (index === -1) {
    wines.push(wine)
  } else {
    wines[index] = wine
  }
  await writeJsonFile(WINES_FILE, wines)
}

export async function deleteWine(id: string): Promise<void> {
  const wines = await listWines()
  await writeJsonFile(
    WINES_FILE,
    wines.filter((wine) => wine.id !== id),
  )
}

export async function listEvaluations(): Promise<WineEvaluation[]> {
  return readJsonFile<WineEvaluation>(EVALUATIONS_FILE)
}

export async function getEvaluation(
  id: string,
): Promise<WineEvaluation | undefined> {
  const evaluations = await listEvaluations()
  return evaluations.find((evaluation) => evaluation.id === id)
}

export async function saveEvaluation(
  evaluation: WineEvaluation,
): Promise<void> {
  const evaluations = await listEvaluations()
  const index = evaluations.findIndex((e) => e.id === evaluation.id)
  if (index === -1) {
    evaluations.push(evaluation)
  } else {
    evaluations[index] = evaluation
  }
  await writeJsonFile(EVALUATIONS_FILE, evaluations)
}

export async function deleteEvaluation(id: string): Promise<void> {
  const evaluations = await listEvaluations()
  await writeJsonFile(
    EVALUATIONS_FILE,
    evaluations.filter((evaluation) => evaluation.id !== id),
  )
}
