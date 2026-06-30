import type { FormType } from "@/generated/prisma/client"

export interface FormItem {
  code: string
  label: string
  requiresObservationOnFail: boolean
}

export interface FormSection {
  title: string
  items: FormItem[]
}

// ─── Tipos para formularios de tabla (REGISTRO_ASISTENCIA, CONTROL_INGRESO_SALIDA) ──

export interface TableColumn {
  key: string
  label: string
  type: "text" | "time" | "select"
  options?: string[]
  /** Ancho relativo en la tabla */
  width?: "xs" | "sm" | "md" | "lg"
}

export interface TableHeaderField {
  key: string
  label: string
  type: "text" | "date" | "time" | "select"
  options?: string[]
  /** "full" ocupa todo el ancho; "half" ocupa mitad */
  span?: "half" | "full"
}

export interface TableConfig {
  headerFields: TableHeaderField[]
  columns: TableColumn[]
  /** Mostrar campo de observaciones al final */
  observations?: boolean
  /** Texto informativo al pie del formulario */
  footerNote?: string
}

export interface FormDefinition {
  formCode: string
  title: string
  /** Si está presente, este formulario NO es un checklist sino un formulario especial */
  customType?: "ATS" | "TABLA"
  /** Configuración de tabla (solo para customType === "TABLA") */
  tableConfig?: TableConfig
  /** Etiquetas de los 3 estados (solo para formularios checklist) */
  labels: { cumple: string; noCumple: string; na: string }
  sections: FormSection[]
}

function item(code: string, label: string, obsOnFail = true): FormItem {
  return { code, label, requiresObservationOnFail: obsOnFail }
}

// ─── Definiciones exactas extraídas de los formatos Excel ────────────────────

export const FORM_DEFINITIONS: Record<FormType, FormDefinition> = {

  // ─── F-GI-80 Inspección para Grúa ────────────────────────────────────────
  INSPECCION_GRUA: {
    formCode: "F-GI-80",
    title: "Inspección para Grúa",
    labels: { cumple: "Correcto", noCumple: "Incorrecto", na: "N/A" },
    sections: [
      {
        title: "Revisión Visual de Grúa",
        items: [
          item("GRU_01", "Sistema de luces (System of Lights)"),
          item("GRU_02", "Alarma aviso de límite (Limit warning alarm)"),
          item("GRU_03", "Estado vidrios de parabrisas (State of front glasses of cabin)"),
          item("GRU_04", "Limpieza de vidrios de cabina (Cleaning of cabin glasses)"),
          item("GRU_05", "Estado de palancas de grúas (State of crane levers)"),
          item("GRU_06", "Revisión visual tambor de guayas (Visual inspection of steel cable drum)"),
          item("GRU_07", "Pines de frenos del tambor de guayas (Drum brake pins of steel cable)"),
          item("GRU_08", "Estado guaya de izaje (Lift state of steel cable)"),
          item("GRU_09", "Los ganchos de patecla están en buenas condiciones (Are the snatch hooks in good condition?)"),
          item("GRU_10", "El gancho utilizado para izar la carga tiene seguro (The hook used to lift the load has safety latch)"),
          item("GRU_11", "Está lubricado el cable de carga (This lubricated the charging cable)"),
          item("GRU_12", "Verificar que la guaya no esté doblada, con quiebres, partes deshilachadas o cualquier otro desperfecto que comprometa su resistencia"),
          item("GRU_13", "El operador de grúa cuenta con la visibilidad del área de trabajo (The crane operator has visibility of the work area)"),
          item("GRU_14", "Realizar levantamiento de prueba con la carga especificada y dejar por 30 segundos a 2 metros (Test lift for 30 seconds at 2 meters)"),
          item("GRU_15", "Sistema de bloqueo de grúa (Crane locking system)"),
          item("GRU_16", "Se encuentra algún tipo de fuga de fluidos en la cabina de grúa o acceso a la torre (Fluid leakage in crane cabin or tower)"),
          item("GRU_17", "Posee extintor (It has a fire extinguisher)"),
          item("GRU_18", "Estado del extintor (State of the extinguisher)"),
          item("GRU_19", "Extintor tiene fecha vigente (Extinguisher has a valid date)"),
          item("GRU_20", "Estado de la silla (Condition of the crane cabin chair)"),
          item("GRU_21", "Orden y Limpieza (Order and Cleaning)"),
          item("GRU_22", "El operador cuenta con radio de comunicación (The crane operator has a communication radio)"),
          item("GRU_23", "Funcionamiento de sistema hidráulico de grúa (Operation of hydraulic crane system)"),
          item("GRU_24", "Estado de pluma de grúa (Crane boom status)"),
          item("GRU_25", "Estado de salida de emergencia de la cabina de grúa (Emergency exit status of the crane cabin)"),
          item("GRU_26", "Estado de la escalera de la torre de grúa (Stair condition of crane tower)"),
          item("GRU_27", "Se identifican los puntos seguros donde se deben colocar los mandos de controles de la cuchara (Safe points for bucket controls are identified)"),
          item("GRU_28", "Estado de radios de comunicación"),
          item("GRU_29", "Verificar palancas de mandos funcionales y alineadas"),
        ],
      },
    ],
  },

  // ─── F-GI-68 Inspección HSE a la Operación ───────────────────────────────
  INSPECCION_HSE: {
    formCode: "F-GI-68",
    title: "Inspección HSE a la Operación",
    labels: { cumple: "Cumple", noCumple: "NC", na: "N/A" },
    sections: [
      {
        title: "Validar en las Bodegas",
        items: [
          item("HSE_01", "Iluminación"),
          item("HSE_02", "Accesos a Bodega / Escaleras"),
          item("HSE_03", "Escotillas (Buen Estado / Aseguradas)"),
          item("HSE_04", "Estado de la Carga en Bodegas — Estiba"),
          item("HSE_05", "Estado de la Carga en Bodegas — Posición de la Carga"),
          item("HSE_06", "Estado de la Carga en Bodegas — Estado de los Puntos de Izaje"),
        ],
      },
      {
        title: "Medición de Gases (Cargas Críticas e Ingresos de Equipos)",
        items: [
          item("HSE_07", "O₂ % (19.5 < O₂ < 23.0) — Dentro del rango seguro"),
          item("HSE_08", "LEL % (< 10%) — Dentro del límite explosivo inferior"),
          item("HSE_09", "CO PPM (< 35 PPM) — Dentro del límite de monóxido de carbono"),
          item("HSE_10", "H₂S PPM (< 10 PPM) — Dentro del límite de sulfuro de hidrógeno"),
        ],
      },
      {
        title: "Disponibilidad de Personal — Inducción y Entrenamiento",
        items: [
          item("HSE_11", "Personal asignado a la MN (cantidad y perfil de acuerdo a lo planeado)"),
          item("HSE_12", "Inducción HSE del personal (cuenta con Sticker Azul)"),
          item("HSE_13", "Entrenamiento del personal (estándar de seguridad según la carga y experiencia — Sticker Naranja)"),
          item("HSE_14", "Certificación del personal (Curso avanzado en alturas)"),
          item("HSE_15", "Horas de trabajo por turnos de Wincheros / Relevos"),
          item("HSE_16", "Horas de trabajo de Estibadores por turnos / Relevos (en bodegas y en muelle)"),
          item("HSE_17", "Horas de trabajo de Operadores Portuarios"),
          item("HSE_18", "Portaloneros / Reguladores viales"),
          item("HSE_19", "El personal cuenta con los EPI básicos y específicos, completos y en buen estado"),
          item("HSE_20", "Plan de Izaje"),
          item("HSE_21", "Permiso de Trabajo (Alturas, caliente, eléctrico)"),
          item("HSE_22", "Charla Preoperativa (participación de todo el personal)"),
        ],
      },
      {
        title: "Recursos Disponibles",
        items: [
          item("HSE_23", "Herramientas extensivas (disponibles y buen estado)"),
          item("HSE_24", "Inspecciones preoperacionales de equipos (Tolvas, Grúas, Elevadores, Aparejos) realizadas — Validar funcionamiento"),
          item("HSE_25", "Capacidad de equipos (soporte de elevadores, aparejos)"),
          item("HSE_26", "Funcionamiento de Tolvas"),
          item("HSE_27", "Grúas de Buque — Movilidad"),
          item("HSE_28", "Grúas de Buque — Sostenibilidad de Carga"),
          item("HSE_29", "Grúas de Buque — Estado del Gancho / Bloque"),
          item("HSE_30", "Grúas de Buque — Certificación de Guayas"),
          item("HSE_31", "Grúas de Buque — Aparejos Inspeccionados"),
          item("HSE_32", "Equipos y sistemas anticaídas (canastilla para elevación, arnés, línea de vida, eslingas)"),
          item("HSE_33", "Elementos de seguridad de equipos y vehículos — Sticker de inspección que habilita para la operación (Amarillo/Verde)"),
          item("HSE_34", "Estado de las Escaleras o Escalas"),
          item("HSE_35", "Colocación de Malla a Portalón"),
          item("HSE_36", "Carpado de Vehículos"),
          item("HSE_37", "Sellamiento de Cucharas (Grabs)"),
          item("HSE_38", "Estado / Instalación de Polisombra"),
          item("HSE_39", "Trincado de la Carga (de acuerdo al estándar de seguridad)"),
          item("HSE_40", "Movilización de Elevadores"),
          item("HSE_41", "Cinturón de Seguridad de Conductores"),
          item("HSE_42", "Arrume de Carga Temporal"),
          item("HSE_43", "Compatibilidad de la Carga"),
          item("HSE_44", "Carga dentro de Límites de Apilamiento / Muelle"),
          item("HSE_45", "Barreras Físicas para Identificación de Carga"),
          item("HSE_46", "Iluminación del área operativa"),
          item("HSE_47", "Señalización"),
          item("HSE_48", "Identificación de Rutas para Vehículos (Mapa vehicular)"),
        ],
      },
      {
        title: "Aspectos Ambientales de la Operación",
        items: [
          item("HSE_49", "Manejo de Residuos (puntos ecológicos), Orden y Limpieza"),
          item("HSE_50", "Mantenimiento de Baños / Baños Portátiles en la Operación"),
          item("HSE_51", "Descarga de Aguas Destinas o Residuales"),
          item("HSE_52", "Suministro de Combustible"),
        ],
      },
    ],
  },

  // ─── F-GI-104 Análisis Seguro del Entorno para Grúa ─────────────────────
  ANALISIS_ENTORNO: {
    formCode: "F-GI-104",
    title: "Análisis Seguro del Entorno para Grúa",
    labels: { cumple: "SI", noCumple: "NO", na: "N/A" },
    sections: [
      {
        title: "Análisis Seguro del Entorno",
        items: [
          item("ENT_01", "Cuenta con radios para la correcta comunicación"),
          item("ENT_02", "Cuenta con buena visibilidad del área de trabajo para la maniobra del equipo"),
          item("ENT_03", "El lugar se encuentra libre de objetos, basuras, obstáculos"),
          item("ENT_04", "La iluminación del lugar es adecuada"),
          item("ENT_05", "Hay máquinas u objetos que interfieran con la actividad en el sitio"),
          item("ENT_06", "El tráfico de personas interfiere con la actividad en el sitio"),
          item("ENT_07", "El equipo asignado cumple con la capacidad y función para la actividad (capacidad en tons verificada)"),
          item("ENT_08", "El espacio permite maniobrar el equipo y no existe riesgo de choques"),
          item("ENT_09", "Se realizó el check list del equipo a utilizar, fue firmado y se reportaron las novedades encontradas"),
          item("ENT_10", "Al realizar la actividad, los puntos ciegos de la grúa le impiden trabajar"),
          item("ENT_11", "Existe personal de guía en caso de no tener una visión clara del área"),
          item("ENT_12", "Presenta derrame de aceites o líquidos"),
          item("ENT_13", "Verifica que no haya objetos que puedan ser averiados al momento del izaje"),
          item("ENT_14", "La grúa cuenta con extintor y equipos de emergencia"),
          item("ENT_15", "El área se encuentra señalizada con los riesgos presentes"),
          item("ENT_16", "Se encuentra en buen estado la salida de emergencia"),
          item("ENT_17", "Se encuentran en buen estado y alineadas las palancas de mando"),
          item("ENT_18", "Identificó los elementos presentes del entorno en zona de muelle"),
        ],
      },
    ],
  },

  // ─── F-GI-107 Inspección de Aparejos (Cuchara) ───────────────────────────
  // Nota: CONFORME SI = sin daño, NO = con daño (lógica invertida por ítems de defecto)
  INSPECCION_CUCHARA: {
    formCode: "F-GI-107",
    title: "Formato de Inspección de Aparejos",
    labels: { cumple: "Conforme", noCumple: "No Conforme", na: "N/A" },
    sections: [
      {
        title: "1. Cadenas",
        items: [
          item("APR_01", "La cadena NO presenta erosiones"),
          item("APR_02", "La cadena NO presenta cambios en su apariencia física (corrosión)"),
          item("APR_03", "NO se observan eslabones torcidos"),
          item("APR_04", "NO se observa desgaste de alguno de los eslabones"),
          item("APR_05", "NO se observan eslabones aplastados"),
          item("APR_06", "NO se observan eslabones con fisuras"),
          item("APR_07", "NO se observan eslabones abiertos"),
          item("APR_08", "NO presentan otros daños visibles que pongan en duda la capacidad de las cadenas"),
        ],
      },
      {
        title: "2. Eslingas Sintéticas",
        items: [
          item("APR_09", "La placa de identificación se encuentra legible"),
          item("APR_10", "NO presenta quemaduras por fricción, calor o contacto con productos químicos"),
          item("APR_11", "NO presenta rasgaduras"),
          item("APR_12", "NO presenta cortes o roturas"),
          item("APR_13", "NO presenta agujeros"),
          item("APR_14", "NO se evidencian nudos en alguna parte de la eslinga"),
          item("APR_15", "NO se evidencian deformaciones en la eslinga"),
          item("APR_16", "Sin cambio de color (sin degradación)"),
          item("APR_17", "NO presentan otros daños visibles que pongan en duda la capacidad de la eslinga"),
        ],
      },
      {
        title: "3. Guayas (Cables de Acero)",
        items: [
          item("APR_18", "Eslinga identificada con el código de color vigente"),
          item("APR_19", "Tiene placa de identificación legible"),
          item("APR_20", "NO se observan hilos rotos cerca a las férulas o en los ojos"),
          item("APR_21", "NO se observa desgaste excesivo del cable"),
          item("APR_22", "La guaya NO presenta corrosión"),
          item("APR_23", "NO se observa doblez pronunciado"),
          item("APR_24", "NO se observa deformación de los terminales (guardacabos, ganchos, etc.)"),
          item("APR_25", "Sin pérdida de diámetro"),
          item("APR_26", "NO presentan otros daños visibles que pongan en duda la capacidad de las guayas"),
        ],
      },
      {
        title: "4. Grilletes",
        items: [
          item("APR_27", "La identificación de los grilletes se encuentra legible"),
          item("APR_28", "El grillete NO presenta corrosión"),
          item("APR_29", "NO se observan deformaciones en el cuerpo y el pasador"),
          item("APR_30", "NO presenta desgaste excesivo del material"),
          item("APR_31", "NO presentan otros daños visibles que pongan en duda la capacidad del grillete"),
        ],
      },
    ],
  },

  // ─── F-GI-103 Análisis Seguro del Entorno Vial ───────────────────────────
  // Usado en COQUE para análisis de volquetas
  INSPECCION_TOLVA: {
    formCode: "F-GI-103",
    title: "Análisis Seguro del Entorno Vial",
    labels: { cumple: "SI", noCumple: "NO", na: "N/A" },
    sections: [
      {
        title: "Análisis Seguro del Entorno Vial",
        items: [
          item("VIA_01", "El terreno de la actividad es estable"),
          item("VIA_02", "El espacio del lugar es el apropiado para realizar maniobras con el equipo"),
          item("VIA_03", "El lugar se encuentra libre de objetos, basuras, maderos"),
          item("VIA_04", "La iluminación del lugar es adecuada"),
          item("VIA_05", "El tráfico vehicular interfiere con la actividad en el sitio"),
          item("VIA_06", "El tráfico de personas interfiere con la actividad en el sitio"),
          item("VIA_07", "El equipo asignado cumple con la capacidad y función para la actividad (especifique el peso de la carga)"),
          item("VIA_08", "El espacio de almacenamiento de la carga permite maniobrar el equipo y no existe riesgo de choques o atrapamientos"),
          item("VIA_09", "El lugar cuenta con las señalizaciones correspondientes"),
          item("VIA_10", "Se realizó el check list del equipo a utilizar, fue firmado y se reportaron las novedades encontradas"),
          item("VIA_11", "Al realizar la actividad, los puntos ciegos del vehículo le impiden totalmente trabajar"),
          item("VIA_12", "Existe personal de guía en caso de no tener una visión clara del área"),
          item("VIA_13", "Se definió y se hizo reconocimiento de la ruta durante la operación"),
          item("VIA_14", "Existe riesgo de choque con otro vehículo"),
          item("VIA_15", "Es importante cumplir con las normas de seguridad vial"),
          item("VIA_16", "Verifica que no hayan guayas ni objetos que puedan ser averiados al momento de levante del volco"),
        ],
      },
    ],
  },

  // ─── F-GH-01 Registro de Asistencia / Charla de Seguridad ───────────────
  // Formato de tabla — gestión humana. Código real: F-GH-01 Rev.04 19-Feb-2025
  REGISTRO_ASISTENCIA: {
    formCode: "F-GH-01",
    title: "Registro de Asistencia y Charla de Seguridad",
    customType: "TABLA",
    labels: { cumple: "Cumple", noCumple: "NC", na: "N/A" },
    sections: [],
    tableConfig: {
      headerFields: [
        { key: "tema",       label: "Tema",      type: "text", span: "full" },
        { key: "fecha",      label: "Fecha",     type: "date", span: "half" },
        { key: "hora",       label: "Hora",      type: "time", span: "half" },
        { key: "tipo",       label: "Tipo",      type: "select",
          options: ["Charla", "Capacitación", "Inducción", "Reinducción", "Reunión"],
          span: "half" },
        { key: "objetivo",   label: "Objetivo",  type: "text", span: "full" },
        { key: "facilitador",label: "Facilitador",type: "text", span: "half" },
        { key: "lugar",      label: "Lugar",     type: "text", span: "half" },
      ],
      columns: [
        { key: "participante", label: "Participante",  type: "text",   width: "lg" },
        { key: "cargo",        label: "Cargo",         type: "text",   width: "md" },
        { key: "cedula",       label: "Cédula",        type: "text",   width: "md" },
        { key: "evaluacion",   label: "Evaluación",    type: "select",
          options: ["B", "M", "R"], width: "xs" },
      ],
      observations: true,
    },
  },

  // ─── F-GI-21 Control de Ingreso y Salida del Personal ───────────────────
  // Formato de tabla — gestión integral. Código real: F-GI-21 Rev.05 01-Jul-2023
  CONTROL_INGRESO_SALIDA: {
    formCode: "F-GI-21",
    title: "Control de Ingreso y Salida del Personal",
    customType: "TABLA",
    labels: { cumple: "Cumple", noCumple: "NC", na: "N/A" },
    sections: [],
    tableConfig: {
      headerFields: [
        { key: "fecha", label: "Fecha", type: "date", span: "half" },
      ],
      columns: [
        { key: "nombre",        label: "Nombre",             type: "text",   width: "lg" },
        { key: "cedula",        label: "Cédula",             type: "text",   width: "md" },
        { key: "cargo",         label: "Cargo / Labor",      type: "text",   width: "lg" },
        { key: "area",          label: "Área",               type: "text",   width: "sm" },
        { key: "horaEntrada",   label: "H. Entrada",         type: "time",   width: "xs" },
        { key: "horaSalida",    label: "H. Salida",          type: "time",   width: "xs" },
        { key: "afeccionSalud", label: "¿Afección salud?",   type: "select",
          options: ["NO", "SI"], width: "xs" },
        { key: "cual",          label: "¿Cuál?",             type: "text",   width: "md" },
      ],
      footerNote: "Con mi firma dejo constancia de que recibí información sobre la política de gestión integrada, normas de seguridad, plan de emergencia, rutas de evacuación y riesgos a los que me encuentro expuesto durante mi estancia en las instalaciones de INGECOL S.A.S.",
    },
  },

  // ─── ATS — Análisis de Trabajo Seguro (F-GI-18) ──────────────────────────
  // Formulario tabla: actividad → pasos → peligros → controles. NO es checklist.
  TAR: {
    formCode: "F-GI-18",
    title: "Análisis de Trabajo Seguro (ATS)",
    customType: "ATS",
    labels: { cumple: "Cumple", noCumple: "NC", na: "N/A" },
    sections: [],   // sin ítems de checklist — usa ATSForm
  },

  // ─── F-GI-19 Permiso de Trabajo en Alturas ───────────────────────────────
  // Ítems extraídos del formato real F-GI-19 Rev.05 26-Feb-2026
  // Convenciones: S = Sí, NO = No, N/A = No Aplica
  PERMISO_ALTURAS: {
    formCode: "F-GI-19",
    title: "Permiso de Trabajo en Alturas",
    labels: { cumple: "SI", noCumple: "NO", na: "N/A" },
    sections: [
      {
        title: "Verificación de Certificados",
        items: [
          item("ALT_01", "Los certificados de trabajo en alturas se encuentran vigentes para todos los trabajadores relacionados en este permiso"),
        ],
      },
      {
        title: "Elementos de Protección Personal (EPP)",
        items: [
          item("ALT_02", "Casco con Barbuquejo",                   false),
          item("ALT_03", "Uniforme (Camisa manga larga / Overol)",  false),
          item("ALT_04", "Protección Respiratoria",                 false),
          item("ALT_05", "Gafas de Seguridad",                     false),
          item("ALT_06", "Botas de Seguridad",                     false),
          item("ALT_07", "Arnés de seguridad",                     false),
          item("ALT_08", "Guantes",                                false),
          item("ALT_09", "Protección Auditiva",                    false),
          item("ALT_10", "Retráctil",                              false),
          item("ALT_11", "Línea de Vida Horizontal",               false),
          item("ALT_12", "Línea de Vida Vertical",                 false),
          item("ALT_13", "Eslinga de Posicionamiento",             false),
        ],
      },
      {
        title: "Medidas de Prevención Contra Caídas",
        items: [
          item("ALT_14", "Si va a utilizar sustancias químicas, ¿cuenta con los controles para su manipulación?"),
          item("ALT_15", "¿El área de trabajo se encuentra completamente delimitada?"),
          item("ALT_16", "¿El sitio donde se ejecutará el trabajo está aislado y señalizado completamente?"),
          item("ALT_17", "¿Se han instalado mamparas o cinta para aislar la zona y no permitir el paso de vehículos o personas?"),
          item("ALT_18", "¿El equipo para acceder al sitio y el de protección personal fueron inspeccionados y están aptos?"),
          item("ALT_19", "¿En caso de contar con sistema de ingeniería, este se encuentra validado por una Persona Calificada y aprobó su uso?"),
          item("ALT_20", "¿Si se instalaron o se cuenta con barandas de seguridad, estas cumplen con todos los requerimientos de seguridad?"),
          item("ALT_21", "¿Se controlaron los riesgos presentes en el sitio de trabajo?"),
          item("ALT_22", "¿Está presente una persona para que active el plan de emergencia en caso de ser necesario?"),
          item("ALT_23", "¿Se cuenta con un procedimiento de seguridad para la ejecución de tarea en alturas asociada a la labor?"),
          item("ALT_24", "¿El personal que va a realizar la labor conoce el procedimiento de emergencia y rescate?"),
          item("ALT_25", "¿Se designó un ayudante de seguridad?"),
          item("ALT_26", "¿En caso de utilizar una línea de advertencia, esta cumple con todos los requerimientos?"),
          item("ALT_27", "¿Se ha dispuesto de los elementos necesarios para izar y descender la herramienta?"),
        ],
      },
      {
        title: "Medidas de Prevención Contra Protección",
        items: [
          item("ALT_28", "¿Cuentan con freno de seguridad, certificado y apropiado para el tipo de línea de vida?"),
          item("ALT_29", "¿Se cuenta con líneas de vida para cada uno de los operadores?"),
          item("ALT_30", "¿Los conectores o mosquetones son de doble seguro?"),
          item("ALT_31", "¿Las cuerdas se encuentran libres de nudos?"),
          item("ALT_32", "¿El personal cuenta con el equipo de protección definido para la tarea?"),
          item("ALT_33", "¿Las guayas de acero son del calibre definido para el tipo de andamio colgante, se encuentran en buen estado y aseguradas en forma correcta?"),
          item("ALT_34", "¿Las barandas del andamio cumplen con las especificaciones técnicas?"),
          item("ALT_35", "¿Las escaleras cumplen las especificaciones técnicas, el terreno es firme y cuentan con zapatas antideslizantes?"),
          item("ALT_36", "¿Se han consultado otros permisos y se cumple con los requerimientos de estos?"),
          item("ALT_37", "¿Cuentan con eslinga de seguridad con absorbente de caídas?"),
        ],
      },
    ],
  },

  // ─── Plan de Izaje ────────────────────────────────────────────────────────
  PLAN_IZAJE: {
    formCode: "F-GI-PIZ",
    title: "Plan de Izaje",
    labels: { cumple: "Cumple", noCumple: "NC", na: "N/A" },
    sections: [
      {
        title: "Datos de la Carga",
        items: [
          item("PIZ_01", "Peso de la carga calculado y verificado"),
          item("PIZ_02", "Centro de gravedad de la carga identificado"),
          item("PIZ_03", "Dimensiones y características de la carga documentadas"),
          item("PIZ_04", "Tipo y configuración del aparejo de izaje seleccionado"),
        ],
      },
      {
        title: "Equipo de Izaje",
        items: [
          item("PIZ_05", "Capacidad nominal de la grúa suficiente para el izaje"),
          item("PIZ_06", "Factor de seguridad del aparejo calculado (mínimo 4:1)"),
          item("PIZ_07", "Eslingas con capacidad de carga suficiente y certificadas"),
          item("PIZ_08", "Longitud y ángulo de las eslingas calculados correctamente"),
        ],
      },
      {
        title: "Zona de Izaje",
        items: [
          item("PIZ_09", "Área despejada en todo el radio de la operación de izaje"),
          item("PIZ_10", "Personal retirado de la zona de riesgo bajo la carga suspendida"),
          item("PIZ_11", "Señalización instalada en el área de izaje"),
          item("PIZ_12", "Barricadas instaladas en el perímetro de seguridad"),
        ],
      },
      {
        title: "Personal y Comunicación",
        items: [
          item("PIZ_13", "Grúero certificado y autorizado para la operación"),
          item("PIZ_14", "Señalero(s) asignado(s), posicionado(s) y visibles"),
          item("PIZ_15", "Código de señales acordado y socializado con todo el equipo"),
          item("PIZ_16", "Radio de comunicación operativo entre todos los miembros del equipo"),
        ],
      },
    ],
  },
}

/** Retorna todos los item codes de un FormType (para validar completitud) */
export function getAllItemCodes(formType: FormType): string[] {
  const def = FORM_DEFINITIONS[formType]
  return def.sections.flatMap((s) => s.items.map((i) => i.code))
}
