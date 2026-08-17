"use client"

import Link from "next/link"
import { ReactNode, useState } from "react"
import { useUsers } from "@/lib/user-store"
import { useCurrentUserId, setCurrentUserId } from "@/lib/current-user"
import { Card } from "@/components/elements/card"
import { Button } from "@/components/elements/button"
import { inputStyle } from "@/components/elements/form"

export const CurrentUserGate = ({ children }: { children: ReactNode }) => {
  const { users, loaded } = useUsers()
  const currentUserId = useCurrentUserId()
  const [selected, setSelected] = useState("")

  const needsSelection = loaded && currentUserId === null

  return (
    <>
      {children}
      {needsSelection && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(43, 37, 35, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 100,
          }}
        >
          <Card style={{ padding: "1.5rem", maxWidth: 360, width: "100%" }}>
            <h3 style={{ marginTop: 0 }}>あなたを選択してください</h3>
            {users.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", fontSize: ".9rem" }}>
                ユーザーが未登録です。管理者モードで
                <Link href="/users">ユーザー管理</Link>
                から作成してください。
              </p>
            ) : (
              <div style={{ display: "grid", gap: ".9rem" }}>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  style={inputStyle}
                >
                  <option value="" disabled>
                    選択してください
                  </option>
                  {users
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name, "ja"))
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                </select>
                <Button
                  type="button"
                  disabled={!selected}
                  onClick={() => setCurrentUserId(selected)}
                  style={{ width: "fit-content" }}
                >
                  決定
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
