import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { timingSafeEqual } from "node:crypto"

const s3 = new S3Client({})

const BUCKET = process.env.BUCKET_NAME
const KEY = process.env.OBJECT_KEY ?? "evaluations.json"
const USERS_KEY = process.env.USERS_OBJECT_KEY ?? "users.json"
const API_KEY = process.env.API_KEY ?? ""

const MAX_WRITE_ATTEMPTS = 5
const MAX_BODY_BYTES = 256 * 1024
const MAX_IMAGE_BYTES = 4 * 1024 * 1024
const MAX_IMAGES_PER_EVALUATION = 3
const IMAGE_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

async function readAll(key) {
  try {
    const result = await s3.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: key })
    )
    const parsed = JSON.parse(await result.Body.transformToString())
    return {
      items: Array.isArray(parsed) ? parsed : [],
      etag: result.ETag,
    }
  } catch (error) {
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      return { items: [], etag: null }
    }
    throw error
  }
}

async function writeAll(key, items, etag) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(items),
      ContentType: "application/json",
      ...(etag ? { IfMatch: etag } : { IfNoneMatch: "*" }),
    })
  )
}

/**
 * Read-modify-write a JSON array object under an S3 conditional write so
 * that concurrent writers cannot silently overwrite each other.
 */
async function mutate(key, apply) {
  for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
    const { items, etag } = await readAll(key)
    const next = apply(items)
    try {
      await writeAll(key, next, etag)
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
  if (value.imageIds !== undefined) {
    const ok =
      Array.isArray(value.imageIds) &&
      value.imageIds.length <= MAX_IMAGES_PER_EVALUATION &&
      value.imageIds.every((v) => typeof v === "string" && UUID_RE.test(v))
    if (!ok) {
      throw new HttpError(
        400,
        `imageIds must be an array of up to ${MAX_IMAGES_PER_EVALUATION} uuids`
      )
    }
  }
  return value
}

function imageKey(evaluationId, imageId) {
  return `images/${evaluationId}/${imageId}`
}

function validateUser(value, id) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "user must be an object")
  }
  if (value.id !== id) {
    throw new HttpError(400, "id in body does not match the path")
  }
  if (typeof value.name !== "string" || value.name.trim() === "") {
    throw new HttpError(400, "name is required")
  }
  return value
}

async function route(event) {
  const method = event.requestContext?.http?.method ?? "GET"
  const segments = (event.rawPath ?? "/").split("/").filter(Boolean)
  const resource = segments[0]

  if (resource === "users") {
    return routeUsers(method, segments, event)
  }
  if (resource === "evaluations") {
    return routeEvaluations(method, segments, event)
  }
  throw new HttpError(404, "not found")
}

async function routeEvaluations(method, segments, event) {
  const id = segments[1] ? decodeURIComponent(segments[1]) : null

  if (segments.length === 4 && segments[2] === "images") {
    if (id === null) throw new HttpError(404, "not found")
    return routeEvaluationImages(
      method,
      id,
      decodeURIComponent(segments[3]),
      event
    )
  }
  if (segments.length > 2) throw new HttpError(404, "not found")

  if (method === "GET" && id === null) {
    const { items: evaluations } = await readAll(KEY)
    return respond(200, { evaluations })
  }

  if (method === "GET") {
    const { items: evaluations } = await readAll(KEY)
    const evaluation = evaluations.find((item) => item.id === id)
    if (!evaluation) throw new HttpError(404, "evaluation not found")
    return respond(200, { evaluation })
  }

  if (method === "PUT" && id !== null) {
    const evaluation = validateEvaluation(parseBody(event), id)
    await mutate(KEY, (evaluations) => {
      const index = evaluations.findIndex((item) => item.id === id)
      if (index === -1) return [...evaluations, evaluation]
      return evaluations.map((item, i) => (i === index ? evaluation : item))
    })
    return respond(200, { evaluation })
  }

  if (method === "DELETE" && id !== null) {
    const { items: before } = await readAll(KEY)
    const target = before.find((item) => item.id === id)
    await mutate(KEY, (evaluations) =>
      evaluations.filter((item) => item.id !== id)
    )
    for (const imageId of target?.imageIds ?? []) {
      await s3
        .send(
          new DeleteObjectCommand({ Bucket: BUCKET, Key: imageKey(id, imageId) })
        )
        .catch(() => {})
    }
    return respond(204)
  }

  throw new HttpError(405, "method not allowed")
}

async function routeEvaluationImages(method, evaluationId, imageId, event) {
  if (!UUID_RE.test(imageId)) throw new HttpError(400, "invalid image id")
  const key = imageKey(evaluationId, imageId)

  if (method === "GET") {
    try {
      const result = await s3.send(
        new GetObjectCommand({ Bucket: BUCKET, Key: key })
      )
      const bytes = await result.Body.transformToByteArray()
      return {
        statusCode: 200,
        headers: {
          "content-type": result.ContentType ?? "application/octet-stream",
        },
        isBase64Encoded: true,
        body: Buffer.from(bytes).toString("base64"),
      }
    } catch (error) {
      if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
        throw new HttpError(404, "image not found")
      }
      throw error
    }
  }

  if (method === "PUT") {
    const contentType = event.headers?.["content-type"] ?? ""
    if (!IMAGE_CONTENT_TYPES.has(contentType)) {
      throw new HttpError(400, "unsupported content type")
    }
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body ?? "", "base64")
      : Buffer.from(event.body ?? "", "utf8")
    if (raw.byteLength === 0) throw new HttpError(400, "empty body")
    if (raw.byteLength > MAX_IMAGE_BYTES) {
      throw new HttpError(413, "image too large")
    }
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: raw,
        ContentType: contentType,
      })
    )
    return respond(204)
  }

  if (method === "DELETE") {
    await s3
      .send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
      .catch((error) => {
        if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
          return
        }
        throw error
      })
    return respond(204)
  }

  throw new HttpError(405, "method not allowed")
}

async function routeUsers(method, segments, event) {
  if (segments.length > 2) throw new HttpError(404, "not found")
  const id = segments[1] ? decodeURIComponent(segments[1]) : null

  if (method === "GET" && id === null) {
    const { items: users } = await readAll(USERS_KEY)
    return respond(200, { users })
  }

  if (method === "GET") {
    const { items: users } = await readAll(USERS_KEY)
    const user = users.find((item) => item.id === id)
    if (!user) throw new HttpError(404, "user not found")
    return respond(200, { user })
  }

  if (method === "PUT" && id !== null) {
    const user = validateUser(parseBody(event), id)
    await mutate(USERS_KEY, (users) => {
      const index = users.findIndex((item) => item.id === id)
      if (index === -1) return [...users, user]
      return users.map((item, i) => (i === index ? user : item))
    })
    return respond(200, { user })
  }

  if (method === "DELETE" && id !== null) {
    await mutate(USERS_KEY, (users) => users.filter((item) => item.id !== id))
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
