import React from "react"
import { Document, Page, View, Text, Image as PDFImage, renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { join } from "path"
import { S } from "./styles"
import { FORM_DEFINITIONS, FORM_DEFINITIONS as FD } from "@/lib/form-definitions"
import { OPERATION_TEMPLATES } from "@/lib/operation-templates"
import type { FormType, OperationType } from "@/generated/prisma/client"
import type { ATSData } from "@/components/forms/ATSForm"
import type { TablaData } from "@/components/forms/TableForm"

// ─── Tipos de entrada ─────────────────────────────────────────────────────────

interface ResponseRecord {
  itemCode: string
  checked: boolean | null
  observation: string | null
}

interface SignatureRecord {
  id: string
  type: string
  signedBy: { name: string }
  signedAt: Date
}

export interface FormPDFInput {
  formInstance: {
    id: string
    formType: string
    status: string
    formData: unknown
    startedAt: Date | null
    completedAt: Date | null
    filledBy: { name: string } | null
    supervisor: { name: string } | null
    operation: {
      date: Date
      shift: string
      type: string
      ship: { name: string; imo: string | null; flag: string | null }
    }
    service: { label: string } | null
    responses: ResponseRecord[]
    signatures: SignatureRecord[]
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("es-CO", {
    day: "2-digit", month: "2-digit", year: "numeric",
  })
}

function fmtTime(d: Date | string): string {
  return new Date(d).toLocaleTimeString("es-CO", {
    hour: "2-digit", minute: "2-digit",
  })
}

// ─── Cabecera del documento (igual en todos los formularios) ──────────────────

function DocHeader({
  formCode,
  title,
  status,
}: {
  formCode: string
  title: string
  status: string
}) {
  const statusLabel: Record<string, string> = {
    PENDING: "Pendiente", IN_PROGRESS: "En Progreso",
    COMPLETED: "Completado", SIGNED: "Firmado",
  }
  return (
    <View style={S.docHeader}>
      {/* Logo */}
      <View style={S.docHeaderLogo}>
        <PDFImage
          src={join(process.cwd(), "public", "logoPORTOPS.png")}
          style={{ width: 48, height: 48, objectFit: "contain" }}
        />
      </View>

      {/* Título */}
      <View style={S.docHeaderCenter}>
        <Text style={S.docHeaderTitle}>{title}</Text>
      </View>

      {/* Metadatos */}
      <View style={S.docHeaderMeta}>
        <View style={S.docHeaderMetaRow}>
          <Text style={S.docHeaderMetaLabel}>Código:</Text>
          <Text style={S.docHeaderMetaValue}>{formCode}</Text>
        </View>
        <View style={S.docHeaderMetaRow}>
          <Text style={S.docHeaderMetaLabel}>Estado:</Text>
          <Text style={S.docHeaderMetaValue}>{statusLabel[status] ?? status}</Text>
        </View>
        <View style={S.docHeaderMetaRow}>
          <Text style={S.docHeaderMetaLabel}>Proceso:</Text>
          <Text style={S.docHeaderMetaValue}>Gestión Integral</Text>
        </View>
      </View>
    </View>
  )
}

// ─── Info de la operación ─────────────────────────────────────────────────────

function OpInfo({ input }: { input: FormPDFInput }) {
  const { formInstance } = input
  const { operation } = formInstance
  const opLabel = OPERATION_TEMPLATES[operation.type as OperationType]?.label ?? operation.type

  return (
    <View style={S.opInfo}>
      <View style={S.opInfoCell}>
        <Text style={S.opInfoLabel}>Buque</Text>
        <Text style={S.opInfoValue}>{operation.ship.name}</Text>
      </View>
      <View style={S.opInfoCell}>
        <Text style={S.opInfoLabel}>Tipo de operación</Text>
        <Text style={S.opInfoValue}>{opLabel}</Text>
      </View>
      <View style={S.opInfoCell}>
        <Text style={S.opInfoLabel}>Fecha</Text>
        <Text style={S.opInfoValue}>{fmtDate(operation.date)}</Text>
      </View>
      <View style={S.opInfoCell}>
        <Text style={S.opInfoLabel}>Turno</Text>
        <Text style={S.opInfoValue}>{operation.shift}</Text>
      </View>
      {formInstance.service && (
        <View style={S.opInfoCell}>
          <Text style={S.opInfoLabel}>Servicio</Text>
          <Text style={S.opInfoValue}>{formInstance.service.label}</Text>
        </View>
      )}
      <View style={S.opInfoCellLast}>
        <Text style={S.opInfoLabel}>Diligenciado por</Text>
        <Text style={S.opInfoValue}>{formInstance.filledBy?.name ?? "—"}</Text>
      </View>
    </View>
  )
}

// ─── Firmas ───────────────────────────────────────────────────────────────────

function SignaturesSection({
  signatures,
}: {
  signatures: SignatureRecord[]
}) {
  const typeLabel: Record<string, string> = {
    OPERATOR: "Operario", SUPERVISOR: "Supervisor", COORDINATOR: "Coordinador",
  }

  return (
    <View style={S.signaturesSection}>
      <View style={S.signaturesHeader}>
        <Text style={S.signaturesHeaderText}>Firmas y Autorizaciones</Text>
      </View>
      <View style={S.signaturesRow}>
        {signatures.length === 0 ? (
          // Celdas vacías para firma manual si no hay firmas digitales
          <>
            {["Operario / Ejecutor", "Supervisor HSE", "Coordinador"].map((role, i) => (
              <View
                key={role}
                style={i < 2 ? S.signatureCell : S.signatureCellLast}
              >
                <View style={S.signatureLine} />
                <Text style={S.signatureRole}>{role}</Text>
              </View>
            ))}
          </>
        ) : (
          signatures.map((sig, i) => (
            <View
              key={sig.id}
              style={i < signatures.length - 1 ? S.signatureCell : S.signatureCellLast}
            >
              <View style={S.signatureLine}>
                <Text style={{ fontSize: 6, color: "#15803d" }}>✓ Firmado digitalmente</Text>
              </View>
              <Text style={S.signatureName}>{sig.signedBy.name}</Text>
              <Text style={S.signatureRole}>
                {typeLabel[sig.type] ?? sig.type}
              </Text>
              <Text style={S.signatureDate}>
                {fmtDate(sig.signedAt)} {fmtTime(sig.signedAt)}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  )
}

// ─── Footer de página ─────────────────────────────────────────────────────────

function PageFooter({
  formCode,
  generated,
}: {
  formCode: string
  generated: string
}) {
  return (
    <View style={S.pageFooter} fixed>
      <Text style={S.pageFooterText}>
        INGECOL S.A.S. — {formCode}
      </Text>
      <Text style={S.pageFooterText} render={({ pageNumber, totalPages }) =>
        `Pág. ${pageNumber} / ${totalPages} — Generado: ${generated}`
      } />
    </View>
  )
}

// ─── Documento PDF para formularios CHECKLIST ─────────────────────────────────

function ChecklistDocument({ input }: { input: FormPDFInput }) {
  const { formInstance } = input
  const definition = FD[formInstance.formType as FormType]

  const responseMap: Record<string, { checked: boolean | null; observation: string | null }> = {}
  for (const r of formInstance.responses) {
    responseMap[r.itemCode] = { checked: r.checked, observation: r.observation }
  }

  const generated = fmtDate(new Date())

  return (
    <Document>
      <Page size="A4" style={S.page}>
        <DocHeader
          formCode={definition.formCode}
          title={definition.title}
          status={formInstance.status}
        />
        <OpInfo input={input} />

        {/* Secciones y ítems */}
        {definition.sections.map((section) => (
          <View key={section.title}>
            <Text style={S.sectionTitle}>{section.title}</Text>

            {/* Encabezado de columnas */}
            <View style={[S.itemTable]}>
              <View style={[S.itemRow, S.itemRowHeader]}>
                <View style={S.itemNum}>
                  <Text style={{ ...S.itemNumText, fontFamily: "Helvetica-Bold" }}>#</Text>
                </View>
                <View style={S.itemLabel}>
                  <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: "#1e1e1e" }}>
                    Ítem
                  </Text>
                </View>
                <View style={S.itemCheck}>
                  <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: "#1e1e1e", textAlign: "center" }}>
                    {definition.labels.cumple}
                  </Text>
                </View>
                <View style={S.itemCheck}>
                  <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: "#1e1e1e", textAlign: "center" }}>
                    {definition.labels.noCumple}
                  </Text>
                </View>
                <View style={S.itemCheck}>
                  <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: "#1e1e1e", textAlign: "center" }}>
                    {definition.labels.na}
                  </Text>
                </View>
                <View style={S.itemObs}>
                  <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: "#1e1e1e" }}>
                    Observación
                  </Text>
                </View>
              </View>

              {/* Filas de ítems */}
              {section.items.map((it, idx) => {
                const resp = responseMap[it.code]
                const isAlt = idx % 2 === 1
                return (
                  <View
                    key={it.code}
                    style={[S.itemRow, isAlt ? S.itemRowAlt : {}]}
                    wrap={false}
                  >
                    <View style={S.itemNum}>
                      <Text style={S.itemNumText}>{idx + 1}</Text>
                    </View>
                    <View style={S.itemLabel}>
                      <Text style={S.itemLabelText}>{it.label}</Text>
                    </View>
                    {/* Cumple */}
                    <View style={S.itemCheck}>
                      {resp?.checked === true && (
                        <Text style={S.badgeCumple}>✓</Text>
                      )}
                    </View>
                    {/* NC */}
                    <View style={S.itemCheck}>
                      {resp?.checked === false && (
                        <Text style={S.badgeNC}>✗</Text>
                      )}
                    </View>
                    {/* N/A */}
                    <View style={S.itemCheckLast}>
                      {resp?.checked === null && (
                        <Text style={S.badgeNA}>N/A</Text>
                      )}
                      {resp === undefined && (
                        <Text style={S.badgePending}>—</Text>
                      )}
                    </View>
                    {/* Observación */}
                    <View style={S.itemObs}>
                      {resp?.observation && (
                        <Text style={S.itemObsText}>{resp.observation}</Text>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        ))}

        <SignaturesSection signatures={formInstance.signatures} />
        <PageFooter formCode={definition.formCode} generated={generated} />
      </Page>
    </Document>
  )
}

// ─── Documento PDF para ATS ───────────────────────────────────────────────────

function ATSDocument({ input }: { input: FormPDFInput }) {
  const { formInstance } = input
  const definition = FD[formInstance.formType as FormType]
  const data = (formInstance.formData ?? {}) as ATSData
  const generated = fmtDate(new Date())

  const headerPairs: [string, string][] = [
    ["Actividad",         data.activity ?? "—"],
    ["Centro de trabajo", data.workCenter ?? "—"],
    ["Ubicación",         data.location ?? "—"],
    ["Fecha inicio",      data.startDate ?? "—"],
    ["Fecha fin",         data.endDate ?? "—"],
    ["Herramientas",      data.tools ?? "—"],
    ["EPP",               data.ppe ?? "—"],
  ]

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={S.page}>
        <DocHeader
          formCode={definition.formCode}
          title={definition.title}
          status={formInstance.status}
        />
        <OpInfo input={input} />

        {/* Campos de cabecera ATS */}
        <View style={S.headerFieldsGrid}>
          {headerPairs.map(([label, value], i) => (
            <View key={label} style={i % 2 === 0 ? S.headerFieldHalf : S.headerFieldHalf}>
              <Text style={S.headerFieldLabel}>{label}</Text>
              <Text style={S.headerFieldValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Tabla de pasos ATS */}
        <Text style={S.sectionTitle}>Análisis de Tareas — Pasos, Peligros y Controles</Text>
        <View style={S.dataTable}>
          {/* Header */}
          <View style={S.dataTableHeaderRow}>
            {["Paso / Actividad", "Peligro", "Consecuencia", "Controles / Medidas", "Aspecto Ambiental", "Responsable"].map(
              (h, i, arr) => (
                <View
                  key={h}
                  style={i < arr.length - 1 ? S.dataTableCell : S.dataTableCellLast}
                >
                  <Text style={S.dataTableHeaderText}>{h}</Text>
                </View>
              )
            )}
          </View>
          {/* Filas */}
          {(data.rows ?? []).map((row, idx) => (
            <View key={row.id ?? idx} style={[S.dataTableRow, idx % 2 === 1 ? S.dataTableRowAlt : {}]} wrap={false}>
              <View style={S.dataTableCell}><Text style={S.dataTableCellText}>{row.step}</Text></View>
              <View style={S.dataTableCell}><Text style={S.dataTableCellText}>{row.hazard}</Text></View>
              <View style={S.dataTableCell}><Text style={S.dataTableCellText}>{row.consequence}</Text></View>
              <View style={S.dataTableCell}><Text style={S.dataTableCellText}>{row.controls}</Text></View>
              <View style={S.dataTableCell}><Text style={S.dataTableCellText}>{row.environmentalAspect}</Text></View>
              <View style={S.dataTableCellLast}><Text style={S.dataTableCellText}>{row.responsible}</Text></View>
            </View>
          ))}
        </View>

        {/* Equipo de trabajo */}
        {(data.team ?? []).length > 0 && (
          <>
            <Text style={[S.sectionTitle, { marginTop: 8 }]}>Equipo de Trabajo</Text>
            <View style={S.dataTable}>
              <View style={S.dataTableHeaderRow}>
                {["Nombre", "Cargo / Rol", "Documento"].map((h, i, arr) => (
                  <View key={h} style={i < arr.length - 1 ? S.dataTableCell : S.dataTableCellLast}>
                    <Text style={S.dataTableHeaderText}>{h}</Text>
                  </View>
                ))}
              </View>
              {data.team.map((m, idx) => (
                <View key={m.id ?? idx} style={[S.dataTableRow, idx % 2 === 1 ? S.dataTableRowAlt : {}]} wrap={false}>
                  <View style={S.dataTableCell}><Text style={S.dataTableCellText}>{m.name}</Text></View>
                  <View style={S.dataTableCell}><Text style={S.dataTableCellText}>{m.role}</Text></View>
                  <View style={S.dataTableCellLast}><Text style={S.dataTableCellText}>{m.documentId}</Text></View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Observaciones */}
        {data.observations && (
          <View style={S.obsBox}>
            <Text style={S.obsLabel}>Observaciones</Text>
            <Text style={S.obsText}>{data.observations}</Text>
          </View>
        )}

        <SignaturesSection signatures={formInstance.signatures} />
        <PageFooter formCode={definition.formCode} generated={generated} />
      </Page>
    </Document>
  )
}

// ─── Documento PDF para formularios TABLA ─────────────────────────────────────

function TablaDocument({ input }: { input: FormPDFInput }) {
  const { formInstance } = input
  const definition = FD[formInstance.formType as FormType]
  const tableConfig = definition.tableConfig!
  const data = (formInstance.formData ?? { headerFields: {}, rows: [] }) as TablaData
  const generated = fmtDate(new Date())

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={S.page}>
        <DocHeader
          formCode={definition.formCode}
          title={definition.title}
          status={formInstance.status}
        />
        <OpInfo input={input} />

        {/* Campos de cabecera */}
        {tableConfig.headerFields.length > 0 && (
          <View style={S.headerFieldsGrid}>
            {tableConfig.headerFields.map((field) => (
              <View
                key={field.key}
                style={field.span === "full" ? S.headerFieldFull : S.headerFieldHalf}
              >
                <Text style={S.headerFieldLabel}>{field.label}</Text>
                <Text style={S.headerFieldValue}>
                  {data.headerFields?.[field.key] ?? "—"}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Tabla de registros */}
        <Text style={S.sectionTitle}>
          Registros — {(data.rows ?? []).length} fila(s)
        </Text>
        <View style={S.dataTable}>
          {/* Header */}
          <View style={S.dataTableHeaderRow}>
            <View style={{ width: 20, padding: 3, borderRightWidth: 1, borderColor: "#e5e5e5" }}>
              <Text style={S.dataTableHeaderText}>#</Text>
            </View>
            {tableConfig.columns.map((col, i, arr) => (
              <View
                key={col.key}
                style={i < arr.length - 1 ? S.dataTableCell : S.dataTableCellLast}
              >
                <Text style={S.dataTableHeaderText}>{col.label}</Text>
              </View>
            ))}
          </View>
          {/* Filas */}
          {(data.rows ?? []).map((row, idx) => (
            <View
              key={row._id ?? idx}
              style={[S.dataTableRow, idx % 2 === 1 ? S.dataTableRowAlt : {}]}
              wrap={false}
            >
              <View style={{ width: 20, padding: 3, borderRightWidth: 1, borderColor: "#e5e5e5", justifyContent: "center" }}>
                <Text style={{ fontSize: 6, color: "#8a8a8a" }}>{idx + 1}</Text>
              </View>
              {tableConfig.columns.map((col, i, arr) => (
                <View
                  key={col.key}
                  style={i < arr.length - 1 ? S.dataTableCell : S.dataTableCellLast}
                >
                  <Text style={S.dataTableCellText}>{row[col.key] ?? ""}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Observaciones */}
        {tableConfig.observations && data.observations && (
          <View style={S.obsBox}>
            <Text style={S.obsLabel}>Observaciones</Text>
            <Text style={S.obsText}>{data.observations}</Text>
          </View>
        )}

        {/* Nota al pie */}
        {tableConfig.footerNote && (
          <View style={{ marginTop: 6, padding: 4, borderWidth: 1, borderColor: "#e5e5e5" }}>
            <Text style={{ fontSize: 6, color: "#6b7280", lineHeight: 1.4 }}>
              {tableConfig.footerNote}
            </Text>
          </View>
        )}

        <SignaturesSection signatures={formInstance.signatures} />
        <PageFooter formCode={definition.formCode} generated={generated} />
      </Page>
    </Document>
  )
}

// ─── Función principal de generación ─────────────────────────────────────────

export async function generatePDF(input: FormPDFInput): Promise<Buffer> {
  const definition = FORM_DEFINITIONS[input.formInstance.formType as FormType]

  let element: React.ReactElement<DocumentProps>

  if (definition.customType === "ATS") {
    element = <ATSDocument input={input} />
  } else if (definition.customType === "TABLA") {
    element = <TablaDocument input={input} />
  } else {
    element = <ChecklistDocument input={input} />
  }

  return renderToBuffer(element)
}
