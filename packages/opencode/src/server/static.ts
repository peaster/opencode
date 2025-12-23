import type { Context, Next } from "hono"
import { desktopAssets } from "./desktop-assets"

const mimeTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".webmanifest": "application/manifest+json",
  ".map": "application/json",
}

function getMimeType(urlPath: string): string {
  const ext = urlPath.substring(urlPath.lastIndexOf("."))
  return mimeTypes[ext] || "application/octet-stream"
}

export async function serveStatic(c: Context, next: Next) {
  const urlPath = c.req.path

  // Try exact match first
  let assetPath = desktopAssets[urlPath]

  // SPA fallback - serve index.html for non-file paths
  if (!assetPath && !urlPath.includes(".")) {
    assetPath = desktopAssets["/"]
  }

  if (assetPath) {
    const file = Bun.file(assetPath)
    const content = await file.arrayBuffer()

    return new Response(content, {
      headers: {
        "Content-Type": getMimeType(urlPath),
        "Cache-Control": urlPath === "/" ? "no-cache" : "public, max-age=31536000, immutable",
      },
    })
  }

  return next()
}
