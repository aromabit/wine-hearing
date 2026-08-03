"use client"

import { useEvaluations } from "@/lib/evaluation-store"
import { Button } from "@/components/elements/button"

export const ExportEvaluationsButton = () => {
  const { evaluations, loaded } = useEvaluations()

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(evaluations, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `wine-evaluations-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleExport}
      disabled={!loaded || evaluations.length === 0}
    >
      JSONエクスポート
    </Button>
  )
}
