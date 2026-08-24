"use client"

import { useEffect } from "react"

const basePath = process.env.NODE_ENV === "production" ? "/wine-hearing" : ""

export const RegisterServiceWorker = () => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    navigator.serviceWorker
      .register(`${basePath}/sw.js`, { scope: `${basePath}/` })
      .catch((error) => {
        console.error("Service worker registration failed:", error)
      })
  }, [])

  return null
}
