import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { timingSafeEqual } from "node:crypto"

const s3 = new S3Client({})

const BUCKET = process.env.BUCKET_NAME
const KEY = process.env.OBJECT_KEY ?? "evaluations.json"
const API_KEY = process.env.API_KEY ?? ""

const MAX_WRITE_ATTEMPTS = 5
const MAX_BODY_BYTES = 256 * 1024

const RATING_CRITERION_IDS = [
  "sweetness",
  "acidity",
  "bitterness",
  "saltiness",
  "tannin",
  "astringency",
  "alcohol",
  "aromaIntensity",
  "citrus",
  "stoneFruit",
  "tropical",
  "redFruit",
  "blackFruit",
  "floral",
  "herbal",
  "spice",
  "oak",
  "nutty",
  "earthy",
]

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
  }
}

function respond(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: body === undefined ? "" : JSON.stringify(body),
  }
}

function authorized(headers) {
  if (API_KEY === "") return false
  const provided = headers?.["x-api-key"] ?? ""
  const a = Buffer.from(provided)
  const b = Buffer.from(API_KEY)
  return a.length === b.length && timingSafeEqual(a, b)
}

async function readAll() {
  try {
    const result = await s3.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: KEY })
    )
    const parsed = JSON.parse(await result.Body.transformToString())
    return {
      evaluations: Array.isArray(parsed) ? parsed : [],
      etag: result.ETag,
    }
  } catch (error) {
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      return { evaluations: [], etag: null }
    }
    throw error
  }
}

async function writeAll(evaluations, etag) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: KEY,
      Body: JSON.stringify(evaluations),
      ContentType: "application/json",
      ...(etag ? { IfMatch: etag } : { IfNoneMatch: "*" }),
    })
  )
}

/**
 * Read-modify-write evaluations.json under an S3 conditional write so that
 * concurrent writers cannot silently overwrite each other.
 */
async function mutate(apply) {
  for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
    const { evaluations, etag } = await readAll()
    const next = apply(evaluations)
    try {
      await writeAll(next, etag)
      return next
    } catch (error) {
      const status = error.$metadata?.httpStatusCode
      if (status === 412 || status === 409) continue
      throw error
    }
  }
  throw new HttpError(503, "write conflict, retry later")
}

function parseBody(event) {
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body ?? "", "base64").toString("utf8")
    : (event.body ?? "")
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
    throw new HttpError(413, "body too large")
  }
  try {
    return JSON.parse(raw)
  } catch {
    throw new HttpError(400, "invalid JSON body")
  }
}

function validateEvaluation(value, id) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "evaluation must be an object")
  }
  if (value.id !== id) {
    throw new HttpError(400, "id in body does not match the path")
  }
  if (typeof value.wineName !== "string" || value.wineName === "") {
    throw new HttpError(400, "wineName is required")
  }
  if (typeof value.evaluatorId !== "string" || value.evaluatorId === "") {
    throw new HttpError(400, "evaluatorId is required")
  }
  if (typeof value.evaluatedAt !== "string" || value.evaluatedAt === "") {
    throw new HttpError(400, "evaluatedAt is required")
  }
  for (const criterion of RATING_CRITERION_IDS) {
    const score = value[criterion]
    if (typeof score !== "number" || !Number.isFinite(score)) {
      throw new HttpError(400, `${criterion} must be a number`)
    }
  }
  return value
}

async function route(event) {
  const method = event.requestContext?.http?.method ?? "GET"
  const segments = (event.rawPath ?? "/").split("/").filter(Boolean)

  if (segments[0] !== "evaluations" || segments.length > 2) {
    throw new HttpError(404, "not found")
  }
  const id = segments[1] ? decodeURIComponent(segments[1]) : null

  if (method === "GET" && id === null) {
    const { evaluations } = await readAll()
    return respond(200, { evaluations })
  }

  if (method === "GET") {
    const { evaluations } = await readAll()
    const evaluation = evaluations.find((item) => item.id === id)
    if (!evaluation) throw new HttpError(404, "evaluation not found")
    return respond(200, { evaluation })
  }

  if (method === "PUT" && id !== null) {
    const evaluation = validateEvaluation(parseBody(event), id)
    await mutate((evaluations) => {
      const index = evaluations.findIndex((item) => item.id === id)
      if (index === -1) return [...evaluations, evaluation]
      return evaluations.map((item, i) => (i === index ? evaluation : item))
    })
    return respond(200, { evaluation })
  }

  if (method === "DELETE" && id !== null) {
    await mutate((evaluations) => evaluations.filter((item) => item.id !== id))
    return respond(204)
  }

  throw new HttpError(405, "method not allowed")
}

export const handler = async (event) => {
  if (!authorized(event.headers)) {
    return respond(401, { message: "unauthorized" })
  }
  try {
    return await route(event)
  } catch (error) {
    if (error instanceof HttpError) {
      return respond(error.statusCode, { message: error.message })
    }
    console.error("unhandled error", error)
    return respond(500, { message: "internal server error" })
  }
}
