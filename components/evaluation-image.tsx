"use client"

import { CSSProperties, useEffect, useState } from "react"
import { fetchRemoteEvaluationImage } from "@/lib/evaluation-api"

/** 認証ヘッダが要るため next/image や単純な <img src> は使えず、fetch した Blob を都度 objectURL 化して表示する。 */
export const EvaluationImage = ({
  evaluationId,
  imageId,
  alt,
  style,
}: {
  evaluationId: string
  imageId: string
  alt?: string
  style?: CSSProperties
}) => {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    let objectUrl: string | undefined
    let cancelled = false
    fetchRemoteEvaluationImage(evaluationId, imageId)
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch((error: unknown) => {
        console.error("failed to load the evaluation image", error)
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [evaluationId, imageId])

  return (
    <img
      src={url}
      alt={alt ?? ""}
      style={{
        background: "var(--color-surface)",
        objectFit: "cover",
        ...style,
      }}
    />
  )
}
