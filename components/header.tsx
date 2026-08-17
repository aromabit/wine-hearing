"use client"

import Link from "next/link"
import { Title } from "@/components/elements/layout"
import { useAdminMode } from "@/lib/admin-mode"

export const Header = () => {
  const { isAdmin, toggleAdminMode } = useAdminMode()

  return (
    <header
      style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "2px solid var(--color-gold)",
        boxShadow: "0 1px 3px rgba(43, 37, 35, 0.06)",
        padding: ".75rem 1.5rem",
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem 2rem",
        minHeight: "3.5rem",
      }}
    >
      <Title>
        <span style={{ marginRight: ".4rem" }}>🍷</span>
        Wine Hearing
      </Title>
      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: ".5rem 1.5rem",
          fontWeight: 600,
          fontSize: ".9rem",
        }}
      >
        <Link href="/" style={{ color: "var(--color-text)" }}>
          評価
        </Link>
        <Link href="/analysis" style={{ color: "var(--color-text)" }}>
          評価マップ
        </Link>
        {isAdmin && (
          <Link href="/users" style={{ color: "var(--color-text)" }}>
            ユーザー管理
          </Link>
        )}
      </nav>
      <button
        type="button"
        onClick={toggleAdminMode}
        aria-pressed={isAdmin}
        style={{
          marginLeft: "auto",
          fontSize: ".8rem",
          fontWeight: 600,
          padding: ".35rem .75rem",
          borderRadius: "999px",
          border: isAdmin
            ? "1px solid var(--color-primary)"
            : "1px solid var(--color-border)",
          backgroundColor: isAdmin ? "var(--color-primary)" : "transparent",
          color: isAdmin ? "var(--color-surface)" : "var(--color-text-muted)",
          cursor: "pointer",
        }}
      >
        {isAdmin ? "管理者モード: ON" : "管理者モード"}
      </button>
    </header>
  )
}
