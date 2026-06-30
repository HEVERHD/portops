"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Ship, ClipboardList } from "lucide-react"
import type { UserRole } from "@/generated/prisma/client"

const NAV_ITEMS = [
  {
    href:  "/operations",
    label: "Operaciones",
    icon:  Ship,
    roles: ["ADMIN", "COORDINATOR", "FIELD_SUPERVISOR", "CLIENT"] as UserRole[],
  },
  {
    href:  "/reports",
    label: "Reportes",
    icon:  ClipboardList,
    roles: ["ADMIN", "COORDINATOR", "CLIENT"] as UserRole[],
  },
]

export default function BottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role))

  return (
    <nav className="md:hidden bg-slate-900 border-t border-slate-800 shrink-0 safe-bottom">
      <div className="flex">
        {items.map((item) => {
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium
                          transition-colors active:scale-95
                          ${active ? "text-blue-400" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-blue-400" : ""}`} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
