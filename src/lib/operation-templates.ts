import type { FormType, FormScope, OperationType } from "@/generated/prisma/client"

export interface FormTemplate {
  formType: FormType
  scope: FormScope
  requiresSignature: boolean
  label: string
}

export interface OperationTemplate {
  label: string
  description: string
  forms: FormTemplate[]
}

// Definición de qué formularios genera cada tipo de operación
export const OPERATION_TEMPLATES: Record<OperationType, OperationTemplate> = {
  ACERO: {
    label: "Descargue de Acero",
    description: "Operación de descargue de acero estructural",
    forms: [
      { formType: "REGISTRO_ASISTENCIA",    scope: "PER_OPERATION", requiresSignature: true,  label: "Registro de Asistencia" },
      { formType: "CONTROL_INGRESO_SALIDA", scope: "PER_OPERATION", requiresSignature: false, label: "Control Ingreso y Salida" },
      { formType: "PERMISO_ALTURAS",        scope: "PER_OPERATION", requiresSignature: true,  label: "Permiso de Trabajo en Alturas" },
      { formType: "INSPECCION_HSE",         scope: "PER_OPERATION", requiresSignature: true,  label: "Inspección HSE" },
      { formType: "PLAN_IZAJE",             scope: "PER_OPERATION", requiresSignature: true,  label: "Plan de Izaje" },
      { formType: "INSPECCION_GRUA",        scope: "PER_SERVICE",   requiresSignature: false, label: "Inspección de Grúa" },
      { formType: "ANALISIS_ENTORNO",       scope: "PER_SERVICE",   requiresSignature: false, label: "Análisis del Entorno" },
    ],
  },

  GRANEL: {
    label: "Operación Granel",
    description: "Descargue de carga a granel",
    forms: [
      { formType: "REGISTRO_ASISTENCIA",    scope: "PER_OPERATION", requiresSignature: true,  label: "Registro de Asistencia" },
      { formType: "CONTROL_INGRESO_SALIDA", scope: "PER_OPERATION", requiresSignature: false, label: "Control Ingreso y Salida" },
      { formType: "TAR",                    scope: "PER_OPERATION", requiresSignature: true,  label: "TAR" },
      { formType: "INSPECCION_HSE",         scope: "PER_OPERATION", requiresSignature: true,  label: "Inspección HSE" },
      { formType: "INSPECCION_GRUA",        scope: "PER_SERVICE",   requiresSignature: false, label: "Inspección de Grúa" },
      { formType: "ANALISIS_ENTORNO",       scope: "PER_SERVICE",   requiresSignature: false, label: "Análisis del Entorno" },
      { formType: "INSPECCION_TOLVA",       scope: "PER_SERVICE",   requiresSignature: false, label: "Inspección de Tolva" },
      { formType: "INSPECCION_CUCHARA",     scope: "PER_SERVICE",   requiresSignature: false, label: "Inspección de Cuchara" },
    ],
  },

  FERTILIZANTE: {
    label: "Operación Fertilizante",
    description: "Descargue de fertilizantes",
    forms: [
      { formType: "REGISTRO_ASISTENCIA",    scope: "PER_OPERATION", requiresSignature: true,  label: "Registro de Asistencia" },
      { formType: "CONTROL_INGRESO_SALIDA", scope: "PER_OPERATION", requiresSignature: false, label: "Control Ingreso y Salida" },
      { formType: "TAR",                    scope: "PER_OPERATION", requiresSignature: true,  label: "TAR" },
      { formType: "INSPECCION_HSE",         scope: "PER_OPERATION", requiresSignature: true,  label: "Inspección HSE" },
      { formType: "INSPECCION_GRUA",        scope: "PER_SERVICE",   requiresSignature: false, label: "Inspección de Grúa" },
      { formType: "ANALISIS_ENTORNO",       scope: "PER_SERVICE",   requiresSignature: false, label: "Análisis del Entorno" },
      { formType: "INSPECCION_TOLVA",       scope: "PER_SERVICE",   requiresSignature: false, label: "Inspección de Tolva" },
      { formType: "INSPECCION_CUCHARA",     scope: "PER_SERVICE",   requiresSignature: false, label: "Inspección de Cuchara" },
    ],
  },

  DESCARGUE_ACERO: {
    label: "Descargue Acero (Multi-servicio)",
    description: "Descargue de acero con múltiples servicios",
    forms: [
      { formType: "TAR",                    scope: "PER_OPERATION", requiresSignature: true,  label: "TAR" },
      { formType: "INSPECCION_HSE",         scope: "PER_OPERATION", requiresSignature: true,  label: "Inspección HSE" },
      { formType: "PLAN_IZAJE",             scope: "PER_OPERATION", requiresSignature: true,  label: "Plan de Izaje" },
      { formType: "REGISTRO_ASISTENCIA",    scope: "PER_SERVICE",   requiresSignature: true,  label: "Registro de Asistencia" },
      { formType: "CONTROL_INGRESO_SALIDA", scope: "PER_SERVICE",   requiresSignature: false, label: "Control Ingreso y Salida" },
      { formType: "INSPECCION_GRUA",        scope: "PER_SERVICE",   requiresSignature: false, label: "Inspección de Grúa" },
      { formType: "ANALISIS_ENTORNO",       scope: "PER_SERVICE",   requiresSignature: false, label: "Análisis del Entorno" },
    ],
  },

  DESCARGUE_GENERAL: {
    label: "Descargue General (Industrial)",
    description: "Descargue de carga general industrial",
    forms: [
      { formType: "REGISTRO_ASISTENCIA",    scope: "PER_OPERATION", requiresSignature: true,  label: "Registro de Asistencia" },
      { formType: "CONTROL_INGRESO_SALIDA", scope: "PER_OPERATION", requiresSignature: false, label: "Control Ingreso y Salida" },
      { formType: "TAR",                    scope: "PER_OPERATION", requiresSignature: true,  label: "TAR" },
      { formType: "INSPECCION_HSE",         scope: "PER_OPERATION", requiresSignature: true,  label: "Inspección HSE" },
      { formType: "PLAN_IZAJE",             scope: "PER_OPERATION", requiresSignature: true,  label: "Plan de Izaje" },
      { formType: "INSPECCION_GRUA",        scope: "PER_SERVICE",   requiresSignature: false, label: "Inspección de Grúa" },
      { formType: "ANALISIS_ENTORNO",       scope: "PER_SERVICE",   requiresSignature: false, label: "Análisis del Entorno" },
    ],
  },

  COQUE: {
    label: "Operación Coque",
    description: "Descargue de coque",
    forms: [
      { formType: "REGISTRO_ASISTENCIA",    scope: "PER_OPERATION", requiresSignature: true,  label: "Registro de Asistencia" },
      { formType: "CONTROL_INGRESO_SALIDA", scope: "PER_OPERATION", requiresSignature: false, label: "Control Ingreso y Salida" },
      { formType: "TAR",                    scope: "PER_OPERATION", requiresSignature: true,  label: "TAR" },
      { formType: "INSPECCION_HSE",         scope: "PER_OPERATION", requiresSignature: true,  label: "Inspección HSE" },
      { formType: "INSPECCION_GRUA",        scope: "PER_SERVICE",   requiresSignature: false, label: "Inspección de Grúa" },
      { formType: "ANALISIS_ENTORNO",       scope: "PER_SERVICE",   requiresSignature: false, label: "Análisis del Entorno" },
      { formType: "INSPECCION_CUCHARA",     scope: "PER_SERVICE",   requiresSignature: false, label: "Inspección de Cuchara" },
    ],
  },
}

// Calcula cuántos formularios se generarán dado un tipo de operación y N servicios
export function countForms(type: OperationType, serviceCount: number): number {
  const template = OPERATION_TEMPLATES[type]
  const perOp = template.forms.filter((f) => f.scope === "PER_OPERATION").length
  const perSvc = template.forms.filter((f) => f.scope === "PER_SERVICE").length
  return perOp + perSvc * serviceCount
}

export const FORM_TYPE_LABELS: Record<FormType, string> = {
  REGISTRO_ASISTENCIA:    "Registro de Asistencia",
  CONTROL_INGRESO_SALIDA: "Control Ingreso y Salida",
  TAR:                    "TAR",
  PERMISO_ALTURAS:        "Permiso de Trabajo en Alturas",
  INSPECCION_HSE:         "Inspección HSE",
  INSPECCION_GRUA:        "Inspección de Grúa",
  ANALISIS_ENTORNO:       "Análisis del Entorno",
  PLAN_IZAJE:             "Plan de Izaje",
  INSPECCION_TOLVA:       "Inspección de Tolva",
  INSPECCION_CUCHARA:     "Inspección de Cuchara",
}
