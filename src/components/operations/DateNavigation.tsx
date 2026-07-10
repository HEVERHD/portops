"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { useLoading } from "@/contexts/LoadingContext"

interface Props {
  dateStr: string   // "YYYY-MM-DD" — el día que se está viendo
  todayStr: string  // "YYYY-MM-DD" — día actual en Colombia
}

export function DateNavigation({ dateStr, todayStr }: Props) {
  const router           = useRouter()
  const { startLoading } = useLoading()
  const inputRef         = useRef<HTMLInputElement>(null)

  function goTo(next: string) {
    startLoading()
    router.push(next === todayStr ? "/operations" : `/operations?date=${next}`)
  }

  function navigate(offset: number) {
    const d = new Date(dateStr + "T12:00:00")
    d.setDate(d.getDate() + offset)
    goTo(d.toLocaleDateString("en-CA"))
  }

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value // "YYYY-MM-DD"
    if (val && val <= todayStr) goTo(val)
  }

  const isToday   = dateStr === todayStr
  const isFuture  = dateStr > todayStr
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

      {/* Clic en la fecha abre el date picker nativo */}
      <button
        type="button"
        onClick={() => inputRef.current?.showPicker()}
        className="relative flex items-center gap-1.5 px-2 py-1 rounded-xl
                   hover:bg-slate-800 transition-colors cursor-pointer"
        title="Ir a una fecha"
      >
        <CalendarDays className={`w-3.5 h-3.5 shrink-0 ${isToday ? "text-orange-400" : "text-slate-500"}`} />
        <span className="text-xs md:text-sm text-slate-300 capitalize select-none">
          {isToday ? `Hoy · ${displayDate}` : displayDate}
        </span>
        {/* Input invisible, sólo se usa para disparar el picker */}
        <input
          ref={inputRef}
          type="date"
          value={dateStr}
          max={todayStr}
          onChange={handlePick}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          tabIndex={-1}
        />
      </button>

      <button
        onClick={() => navigate(+1)}
        disabled={isToday || isFuture}
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
