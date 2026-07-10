"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { useLoading } from "@/contexts/LoadingContext"

interface Props {
  dateStr: string   // "YYYY-MM-DD" — el día que se está viendo
  todayStr: string  // "YYYY-MM-DD" — día actual en Colombia
}

export function DateNavigation({ dateStr, todayStr }: Props) {
  const router         = useRouter()
  const { startLoading } = useLoading()

  function navigate(offset: number) {
    // Usamos T12:00:00 para evitar problemas de DST al hacer +/-1 día
    const d = new Date(dateStr + "T12:00:00")
    d.setDate(d.getDate() + offset)
    const next = d.toLocaleDateString("en-CA") // YYYY-MM-DD
    startLoading()
    router.push(next === todayStr ? "/operations" : `/operations?date=${next}`)
  }

  const isToday    = dateStr === todayStr
  const isFuture   = dateStr > todayStr
  const displayDate = new Date(dateStr + "T12:00:00").toLocaleDateString("es-CO", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    year:    "numeric",
  })

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => navigate(-1)}
        className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400
                   hover:text-white hover:bg-slate-800 transition-colors"
        title="Día anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1.5 px-1">
        {isToday && <CalendarDays className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
        <span className="text-xs md:text-sm text-slate-300 capitalize select-none">
          {isToday ? `Hoy · ${displayDate}` : displayDate}
        </span>
      </div>

      <button
        onClick={() => navigate(+1)}
        disabled={isFuture}
        className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400
                   hover:text-white hover:bg-slate-800 transition-colors
                   disabled:opacity-30 disabled:cursor-not-allowed"
        title="Día siguiente"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
