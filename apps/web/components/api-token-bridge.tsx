"use client"

import { useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { setApiTokenProvider } from "@/lib/api"

/**
 * Null-render bridge between Clerk's client SDK and the axios client:
 * every request to the FastAPI backend needs a Clerk Bearer token, which
 * the backend's auth middleware exchanges for `req.state.clerk.sub`.
 */
export function ApiTokenBridge() {
  const { getToken } = useAuth()

  useEffect(() => {
    setApiTokenProvider(async () => {
      try {
        return await getToken()
      } catch {
        return null
      }
    })
  }, [getToken])

  return null
}
