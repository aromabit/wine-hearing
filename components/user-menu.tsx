"use client"

import { useEffect, useRef, useState } from "react"
import { useAdminMode } from "@/lib/admin-mode"
import { clearCurrentUserId, useCurrentUserId } from "@/lib/current-user"
import { useUsers } from "@/lib/user-store"

export const UserMenu = () => {
  const { isAdmin, toggleAdminMode } = useAdminMode()
  const currentUserId = useCurrentUserId()
  const { users } = useUsers()
  const currentUserName = users.find((u) => u.id === currentUserId)?.name
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("click", onClickOutside)
    return () => document.removeEventListener("click", onClickOutside)
  }, [open])

  return (
    <div style={{ marginLeft: "auto", position: "relative" }} ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={
          currentUserName
            ? `${currentUserName}${isAdmin ? "（管理者）" : ""}`
            : "ユーザーメニュー"
        }
        title={currentUserName ?? "ユーザーメニュー"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.25rem",
          height: "2.25rem",
          fontSize: "1.1rem",
          lineHeight: 1,
          color: isAdmin ? "var(--color-primary)" : "var(--color-text)",
          background: "transparent",
          border: isAdmin
            ? "1px solid var(--color-primary)"
            : "1px solid var(--color-border)",
          borderRadius: "50%",
          cursor: "pointer",
        }}
      >
        <span aria-hidden>{isAdmin ? "🛡️" : "👤"}</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + .4rem)",
            right: 0,
            minWidth: "12rem",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow-lg)",
            padding: ".4rem",
            display: "grid",
            gap: ".2rem",
            zIndex: 20,
          }}
        >
          <div
            style={{
              fontSize: ".75rem",
              color: "var(--color-text-muted)",
              padding: ".4rem .6rem 0",
            }}
          >
            評価者
          </div>
          <div
            style={{
              fontSize: ".9rem",
              fontWeight: 700,
              padding: "0 .6rem .4rem",
            }}
          >
            {currentUserName ?? "未選択"}
          </div>
          <button
            type="button"
            onClick={() => {
              clearCurrentUserId()
              setOpen(false)
            }}
            style={menuButtonStyle}
          >
            ユーザーを変更
          </button>
          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              margin: ".2rem 0",
            }}
          />
          <button
            type="button"
            onClick={() => {
              toggleAdminMode()
              setOpen(false)
            }}
            aria-pressed={isAdmin}
            style={menuButtonStyle}
          >
            {isAdmin ? "管理者モードを終了" : "管理者モードにする"}
          </button>
        </div>
      )}
    </div>
  )
}

const menuButtonStyle = {
  display: "block",
  width: "100%",
  textAlign: "left" as const,
  fontSize: ".85rem",
  fontWeight: 600,
  color: "var(--color-text)",
  background: "transparent",
  border: "none",
  borderRadius: 6,
  padding: ".5rem .6rem",
  cursor: "pointer",
}
