"use client"

import { useEffect, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const isIos = () =>
  typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent)

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true)

export const InstallPwaSection = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    setInstalled(isStandalone())

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  if (installed) {
    return <p style={mutedStyle}>すでにホーム画面に追加済み。</p>
  }

  if (deferredPrompt) {
    return (
      <div style={{ display: "grid", gap: ".6rem" }}>
        <p style={mutedStyle}>このデバイスはワンタップで追加できる。</p>
        <button type="button" onClick={handleInstall} style={buttonStyle}>
          ホーム画面に追加
        </button>
      </div>
    )
  }

  if (isIos()) {
    return (
      <p style={mutedStyle}>
        Safari下部の共有アイコン<span aria-hidden>（□↑）</span>をタップ →
        「ホーム画面に追加」を選択。
      </p>
    )
  }

  return (
    <p style={mutedStyle}>
      ブラウザのメニューから「ホーム画面に追加」または「アプリをインストール」を選択。
    </p>
  )
}

const mutedStyle = { color: "var(--color-text-muted)", fontSize: ".9rem", margin: 0 }
const buttonStyle = {
  justifySelf: "start" as const,
  background: "var(--color-primary)",
  color: "#fff",
  border: "none",
  borderRadius: "var(--radius)",
  fontWeight: 700,
  fontSize: ".9rem",
  padding: ".6rem 1.2rem",
  cursor: "pointer",
}
