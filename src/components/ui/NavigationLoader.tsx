"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useLoading } from "@/contexts/LoadingContext"

/** Clears the global loader whenever the route (path or query) finishes changing. */
export function NavigationLoader() {
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const { stopLoading } = useLoading()

  useEffect(() => {
    stopLoading()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  return null
}
