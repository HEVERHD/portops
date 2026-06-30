import { StyleSheet } from "@react-pdf/renderer"

// Paleta de colores Ingecol
const C = {
  black:      "#0a0a0a",
  darkGray:   "#1e1e1e",
  medGray:    "#4a4a4a",
  lightGray:  "#8a8a8a",
  border:     "#cccccc",
  borderLight:"#e5e5e5",
  bgLight:    "#f5f5f5",
  bgHeader:   "#1a2744",   // azul marino Ingecol
  white:      "#ffffff",
  cumple:     "#15803d",   // verde
  noCumple:   "#b91c1c",   // rojo
  na:         "#6b7280",   // gris
  amber:      "#92400e",
}

export const S = StyleSheet.create({
  // ── Página ──────────────────────────────────────────────
  page: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: C.black,
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 28,
    backgroundColor: C.white,
  },

  // ── Cabecera del documento ───────────────────────────────
  docHeader: {
    flexDirection: "row",
    alignItems: "stretch",
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 6,
  },
  docHeaderLogo: {
    width: 80,
    backgroundColor: C.bgHeader,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  docHeaderLogoText: {
    color: C.white,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  docHeaderLogoSub: {
    color: "#93c5fd",
    fontSize: 6,
    marginTop: 1,
    letterSpacing: 0.5,
  },
  docHeaderCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: C.border,
  },
  docHeaderTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    textTransform: "uppercase",
    color: C.black,
  },
  docHeaderMeta: {
    width: 100,
    padding: 4,
    justifyContent: "center",
  },
  docHeaderMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  docHeaderMetaLabel: {
    color: C.lightGray,
    fontSize: 6,
    textTransform: "uppercase",
  },
  docHeaderMetaValue: {
    color: C.black,
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
  },

  // ── Info de operación ────────────────────────────────────
  opInfo: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 6,
  },
  opInfoCell: {
    flex: 1,
    padding: 4,
    borderRightWidth: 1,
    borderColor: C.border,
  },
  opInfoCellLast: {
    flex: 1,
    padding: 4,
  },
  opInfoLabel: {
    fontSize: 6,
    color: C.lightGray,
    textTransform: "uppercase",
    marginBottom: 1,
  },
  opInfoValue: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: C.black,
  },

  // ── Sección ──────────────────────────────────────────────
  sectionTitle: {
    backgroundColor: C.bgHeader,
    color: C.white,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    padding: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
    marginBottom: 0,
  },

  // ── Tabla de ítems checklist ─────────────────────────────
  itemTable: {
    borderWidth: 1,
    borderColor: C.border,
    borderTopWidth: 0,
  },
  itemRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: C.borderLight,
    minHeight: 16,
  },
  itemRowAlt: {
    backgroundColor: C.bgLight,
  },
  itemRowHeader: {
    backgroundColor: "#e2e8f0",
  },
  itemNum: {
    width: 20,
    padding: 3,
    borderRightWidth: 1,
    borderColor: C.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  itemNumText: {
    fontSize: 6,
    color: C.lightGray,
  },
  itemLabel: {
    flex: 1,
    padding: 3,
    borderRightWidth: 1,
    borderColor: C.borderLight,
    justifyContent: "center",
  },
  itemLabelText: {
    fontSize: 7,
    color: C.black,
    lineHeight: 1.3,
  },
  itemCheck: {
    width: 38,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderColor: C.borderLight,
  },
  itemCheckLast: {
    width: 38,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  itemObs: {
    width: 80,
    padding: 3,
    justifyContent: "center",
  },
  itemObsText: {
    fontSize: 6,
    color: C.medGray,
    fontStyle: "italic",
  },

  // ── Badges de estado en checklist ───────────────────────
  badgeCumple: {
    backgroundColor: "#dcfce7",
    color: C.cumple,
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  badgeNC: {
    backgroundColor: "#fee2e2",
    color: C.noCumple,
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  badgeNA: {
    backgroundColor: "#f3f4f6",
    color: C.na,
    fontSize: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  badgePending: {
    backgroundColor: "#fef9c3",
    color: C.amber,
    fontSize: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },

  // ── Tabla genérica (ATS / TABLA) ─────────────────────────
  dataTable: {
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 4,
  },
  dataTableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  dataTableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: C.borderLight,
    minHeight: 18,
  },
  dataTableRowAlt: {
    backgroundColor: C.bgLight,
  },
  dataTableCell: {
    flex: 1,
    padding: 3,
    borderRightWidth: 1,
    borderColor: C.borderLight,
    justifyContent: "center",
  },
  dataTableCellLast: {
    flex: 1,
    padding: 3,
    justifyContent: "center",
  },
  dataTableHeaderText: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: C.darkGray,
    textTransform: "uppercase",
  },
  dataTableCellText: {
    fontSize: 7,
    color: C.black,
    lineHeight: 1.3,
  },

  // ── Campos de cabecera (ATS / TABLA) ────────────────────
  headerFieldsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 4,
  },
  headerFieldHalf: {
    width: "50%",
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.borderLight,
  },
  headerFieldFull: {
    width: "100%",
    padding: 4,
    borderBottomWidth: 1,
    borderColor: C.borderLight,
  },
  headerFieldLabel: {
    fontSize: 6,
    color: C.lightGray,
    textTransform: "uppercase",
    marginBottom: 1,
  },
  headerFieldValue: {
    fontSize: 7,
    color: C.black,
  },

  // ── Firmas ───────────────────────────────────────────────
  signaturesSection: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  signaturesHeader: {
    backgroundColor: C.bgHeader,
    padding: 4,
  },
  signaturesHeaderText: {
    color: C.white,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  signaturesRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: C.borderLight,
  },
  signatureCell: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderColor: C.borderLight,
    alignItems: "center",
  },
  signatureCellLast: {
    flex: 1,
    padding: 6,
    alignItems: "center",
  },
  signatureLine: {
    width: 100,
    borderBottomWidth: 1,
    borderColor: C.border,
    marginBottom: 4,
    height: 24,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  signatureName: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: C.black,
    textAlign: "center",
  },
  signatureRole: {
    fontSize: 6,
    color: C.lightGray,
    textAlign: "center",
    marginTop: 1,
  },
  signatureDate: {
    fontSize: 6,
    color: C.na,
    textAlign: "center",
    marginTop: 1,
  },

  // ── Observaciones ────────────────────────────────────────
  obsBox: {
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 4,
    padding: 5,
  },
  obsLabel: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: C.lightGray,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  obsText: {
    fontSize: 7,
    color: C.black,
    lineHeight: 1.4,
  },

  // ── Footer de página ─────────────────────────────────────
  pageFooter: {
    position: "absolute",
    bottom: 16,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: C.borderLight,
    paddingTop: 4,
  },
  pageFooterText: {
    fontSize: 6,
    color: C.lightGray,
  },
})
