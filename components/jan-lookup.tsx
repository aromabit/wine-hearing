"use client"

import { useState, useTransition } from "react"
import { lookupWineByJan } from "@/lib/actions/wine-lookup"
import { RakutenWineCandidate } from "@/lib/rakuten"
import { Card } from "@/components/elements/card"
import { Button } from "@/components/elements/button"
import { inputStyle, labelStyle } from "@/components/elements/form"

export const JanLookup = ({
  onSelect,
}: {
  onSelect: (name: string) => void
}) => {
  const [jan, setJan] = useState("")
  const [candidates, setCandidates] = useState<RakutenWineCandidate[]>([])
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()

  const handleSearch = () => {
    setError(undefined)
    setCandidates([])
    startTransition(async () => {
      const result = await lookupWineByJan(jan)
      if ("error" in result) {
        setError(result.error)
      } else {
        setCandidates(result.candidates)
      }
    })
  }

  return (
    <Card style={{ padding: "1rem 1.1rem", background: "var(--color-bg)" }}>
      <label htmlFor="jan-input" style={labelStyle}>
        JANコードで検索（楽天市場の商品情報を参照）
      </label>
      <div style={{ display: "flex", gap: ".5rem", marginTop: ".4rem" }}>
        <input
          id="jan-input"
          value={jan}
          onChange={(e) => setJan(e.target.value)}
          placeholder="例: 4901234567890"
          style={{ ...inputStyle, flex: 1 }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={pending || jan.trim() === ""}
          onClick={handleSearch}
        >
          {pending ? "検索中..." : "検索"}
        </Button>
      </div>

      {error && (
        <p style={{ color: "#b3261e", fontSize: ".8rem", marginTop: ".5rem" }}>
          {error}
        </p>
      )}

      {candidates.length > 0 && (
        <div style={{ display: "grid", gap: ".5rem", marginTop: ".75rem" }}>
          {candidates.map((candidate) => (
            <button
              key={candidate.itemUrl}
              type="button"
              onClick={() => onSelect(candidate.itemName)}
              style={{
                display: "flex",
                gap: ".75rem",
                alignItems: "center",
                textAlign: "left",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 2,
                padding: ".5rem .75rem",
              }}
            >
              {candidate.imageUrl && (
                <img
                  src={candidate.imageUrl}
                  alt=""
                  width={40}
                  height={40}
                  style={{ borderRadius: 6, objectFit: "cover", flexShrink: 0 }}
                />
              )}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: ".85rem",
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {candidate.itemName}
                </div>
                <div
                  style={{ fontSize: ".75rem", color: "var(--color-text-muted)" }}
                >
                  ¥{candidate.itemPrice.toLocaleString()} — {candidate.shopName}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </Card>
  )
}
