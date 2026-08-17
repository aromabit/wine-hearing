"use client"

import { FormEvent, useState } from "react"
import { createUser, useUsers } from "@/lib/user-store"
import { useAdminMode } from "@/lib/admin-mode"
import { Card } from "@/components/elements/card"
import { Button } from "@/components/elements/button"
import { fieldStyle, inputStyle, labelStyle } from "@/components/elements/form"

export const UsersListClient = () => {
  const { users, loaded } = useUsers()
  const { isAdmin } = useAdminMode()
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(undefined)

    const form = e.currentTarget
    const formData = new FormData(form)
    const name = (formData.get("name") as string)?.trim()
    if (!name) {
      setError("評価者名は必須です")
      return
    }

    setPending(true)
    try {
      await createUser({ id: crypto.randomUUID(), name })
      form.reset()
    } catch (createError) {
      console.error("failed to create the user", createError)
      setError(
        createError instanceof Error
          ? createError.message
          : "作成に失敗しました。通信環境を確認してもう一度お試しください。"
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <h2 style={{ margin: 0 }}>ユーザー管理</h2>

      {isAdmin && (
        <Card style={{ padding: "1.25rem" }}>
          <h3 style={{ marginBottom: ".9rem" }}>ユーザーを追加</h3>
          <form
            onSubmit={(e) => void handleSubmit(e)}
            style={{ display: "flex", gap: ".75rem", alignItems: "flex-end" }}
          >
            <div style={{ ...fieldStyle, flex: 1 }}>
              <label htmlFor="name" style={labelStyle}>
                評価者名 *
              </label>
              <input id="name" name="name" required style={inputStyle} />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "作成中..." : "追加"}
            </Button>
          </form>
          {error && (
            <p style={{ color: "#b3261e", fontSize: ".875rem", marginTop: ".5rem" }}>
              {error}
            </p>
          )}
        </Card>
      )}

      {!loaded ? null : users.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)" }}>
          ユーザーはまだ登録されていません。
          {isAdmin
            ? "上のフォームから追加できます。"
            : "管理者モードのユーザーが追加できます。"}
        </p>
      ) : (
        <div style={{ display: "grid", gap: ".6rem" }}>
          {users
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name, "ja"))
            .map((user) => (
              <Card
                key={user.id}
                style={{ padding: ".75rem 1.25rem", fontWeight: 600 }}
              >
                {user.name}
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
