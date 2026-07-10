"use client"

import { createContext, useContext, useState, useCallback } from "react"

interface LoadingContextValue {
  isLoading: boolean
  startLoading: () => void
  stopLoading:  () => void
}

const LoadingContext = createContext<LoadingContextValue>({
  isLoading:    false,
  startLoading: () => {},
  stopLoading:  () => {},
})

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const startLoading = useCallback(() => setIsLoading(true),  [])
  const stopLoading  = useCallback(() => setIsLoading(false), [])

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}

export const useLoading = () => useContext(LoadingContext)
