import type { MetadataRoute } from "next"

export const dynamic = "force-static"

const basePath = process.env.NODE_ENV === "production" ? "/wine-hearing" : ""

const manifest = (): MetadataRoute.Manifest => ({
  name: "Wine Hearing",
  short_name: "Wine Hearing",
  description: "ソムリエ官能評価データ収集プラットフォーム",
  start_url: `${basePath}/`,
  scope: `${basePath}/`,
  display: "standalone",
  background_color: "#f7f5f3",
  theme_color: "#a6093d",
  icons: [
    {
      src: `${basePath}/icon-192.png`,
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: `${basePath}/icon-512.png`,
      sizes: "512x512",
      type: "image/png",
    },
  ],
})

export default manifest
