"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useLoading } from "@/contexts/LoadingContext"

/** Clears the global loader whenever the route finishes changing. */
export function NavigationLoader() {
  const pathname = usePathname()
  const { stopLoading } = useLoading()

  useEffect(() => {
    stopLoading()
  }, [pathname, stopLoading])

  return null
}
