"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import Image from "next/image"
import {
  Ship,
  ClipboardList,
  LogOut,
  ChevronRight,
} from "lucide-react"
import type { UserRole } from "@/generated/prisma/client"

interface SidebarUser {
  name: string
  email: string
  role: UserRole
  organizationName: string
}

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  COORDINATOR: "Coordinador",
  FIELD_SUPERVISOR: "Supervisor de Campo",
  CLIENT: "Cliente",
}

const NAV_ITEMS = [
  {
    href: "/operations",
    label: "Operaciones",
    icon: Ship,
    roles: ["ADMIN", "COORDINATOR", "FIELD_SUPERVISOR", "CLIENT"] as UserRole[],
  },
  {
    href: "/reports",
    label: "Reportes",
    icon: ClipboardList,
    roles: ["ADMIN", "COORDINATOR", "CLIENT"] as UserRole[],
  },
]

export default function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname()

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user.role)
  )

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-slate-900 border-r border-slate-800 h-full shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Image
            src="/logoPORTOPS.png"
            alt="PortOps"
            width={36}
            height={36}
            className="rounded-xl shrink-0"
          />
          <div className="min-w-0">
            <p className="font-bold text-white text-sm truncate">PortOps</p>
            <p className="text-xs text-slate-400 truncate">{user.organizationName}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {visibleItems.map((item) => {
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group
                ${active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
            </Link>
          )
        })}
      </nav>

      {/* User / Logout */}
      <div className="p-3 border-t border-slate-800">
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-medium text-white truncate">{user.name}</p>
          <p className="text-xs text-slate-400">{ROLE_LABELS[user.role]}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400
                     hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
