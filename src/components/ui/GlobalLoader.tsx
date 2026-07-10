"use client"

import Image from "next/image"
import { useLoading } from "@/contexts/LoadingContext"

export function GlobalLoader() {
  const { isLoading } = useLoading()
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center
                    bg-slate-950/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Logo pulsante */}
        <div className="relative">
          <Image
            src="/ingecol.png"
            alt="Ingecol"
            width={52}
            height={52}
            className="rounded-2xl animate-pulse"
          />
          {/* Anillo giratorio */}
          <span
            className="absolute -inset-2 rounded-[1.2rem] border-2 border-transparent
                       border-t-orange-500 animate-spin"
          />
        </div>
        <p className="text-sm text-slate-400 tracking-wide">Cargando…</p>
      </div>
    </div>
  )
}
