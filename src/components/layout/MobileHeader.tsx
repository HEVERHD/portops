"use client"

import Image from "next/image"
import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

interface Props {
  organizationName: string
  userName: string
}

export default function MobileHeader({ organizationName, userName }: Props) {
  return (
    <header className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2.5">
        <Image
          src="/logoPORTOPS.png"
          alt="PortOps"
          width={32}
          height={32}
          className="rounded-xl shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-bold text-white leading-none">PortOps</p>
          <p className="text-xs text-slate-400 truncate">{organizationName}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs font-medium text-white leading-none">{userName}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          aria-label="Cerrar sesión"
          className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400
                     hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
