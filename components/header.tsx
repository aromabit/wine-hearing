"use client"

import Link from "next/link"
import { Title } from "@/components/elements/layout"
import { useAdminMode } from "@/lib/admin-mode"
import { UserMenu } from "@/components/user-menu"

export const Header = () => {
  const { isAdmin } = useAdminMode()

  return (
    <header
      style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "2px solid var(--color-gold)",
        boxShadow: "0 1px 3px rgba(43, 37, 35, 0.06)",
        padding: ".75rem 1rem",
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem 2rem",
        minHeight: "2.75rem",
      }}
    >
      <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
        <Title>
          <span style={{ marginRight: ".4rem" }}>🍷</span>
          Hearing
        </Title>
      </Link>
      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: ".5rem 1.5rem",
          fontWeight: 600,
          fontSize: ".9rem",
        }}
      >
        <Link href="/analysis" style={{ color: "var(--color-text)" }}>
          評価マップ
        </Link>
        {isAdmin && (
          <Link href="/users" style={{ color: "var(--color-text)" }}>
            ユーザー管理
          </Link>
        )}
      </nav>
      <UserMenu />
    </header>
  )
}
