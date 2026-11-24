// PDF del comprobante de venta (ticket POS de 80 mm) y reporte de comprobantes (PDF / Excel).
// "Comprobante de venta": documento interno SIN validez fiscal (la factura electrónica la valida la DIAN).
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { showSystemErrorAlert } from "@/shared/services/alertService";
import {
  getInvoiceById,
  getInvoiceReportData,
  paymentMethodLabel,
  formatCOP,
  formatDateTime,
  INVOICE_STATUSES,
} from "@/services/invoiceApi";

// ─────────────────────────── Ticket 80 mm ───────────────────────────
const TICKET_WIDTH = 80;
const MARGIN = 4;
const CONTENT = TICKET_WIDTH - MARGIN * 2;

// Dibuja el ticket en `doc` y devuelve la Y final (para calcular el alto exacto).
function drawReceipt(doc, invoice) {
  const center = TICKET_WIDTH / 2;
  const right = TICKET_WIDTH - MARGIN;
  let y = 8;

  const text = (value, { size = 8, bold = false, align = "left", x } = {}) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(String(value), CONTENT);
    const posX = x ?? (align === "center" ? center : align === "right" ? right : MARGIN);
    doc.text(lines, posX, y, { align });
    y += lines.length * (size * 0.45) + 1;
  };
  const row = (label, value, { size = 8, bold = false } = {}) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.text(label, MARGIN, y);
    doc.text(value, right, y, { align: "right" });
    y += size * 0.45 + 1.2;
  };
  const divider = () => {
    doc.setLineDashPattern([1, 1], 0);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, y - 1.5, right, y - 1.5);
    doc.setLineDashPattern([], 0);
    y += 2;
  };

  // Encabezado
  text("Cafeterito", { size: 14, bold: true, align: "center" });
  text("Comprobante de venta", { size: 10, align: "center" });
  text(invoice.invoiceNumber, { size: 11, bold: true, align: "center" });
  y += 1;
  divider();

  text(`Fecha: ${formatDateTime(invoice.createdAt)}`);
  text(`Mesa: ${invoice.tableNumber}`);
  text(`Mesero: ${invoice.waiter ?? "Sin asignar"}`);
  text(`Cajero: ${invoice.cashier ?? "-"}`);
  text(`Cliente: ${invoice.customerName}`);
  if (invoice.customerDocument) {
    text(`Documento: ${invoice.customerDocumentType ?? ""} ${invoice.customerDocument}`.trim());
  }
  divider();

  // Detalle
  autoTable(doc, {
    startY: y - 2,
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: CONTENT,
    theme: "plain",
    head: [["Cant.", "Producto", "P. unit.", "Subtotal"]],
    body: invoice.items.map((i) => [i.quantity, i.productName, formatCOP(i.unitPrice), formatCOP(i.lineTotal)]),
    styles: { font: "helvetica", fontSize: 7, cellPadding: { top: 0.8, bottom: 0.8, left: 0.5, right: 0.5 }, textColor: 20 },
    headStyles: { fontStyle: "bold", lineWidth: { bottom: 0.2 }, lineColor: 60 },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 17, halign: "right" },
      3: { cellWidth: 18, halign: "right" },
    },
  });
  y = doc.lastAutoTable.finalY + 5;
  divider();

  // Totales
  row("Subtotal", formatCOP(invoice.subtotal));
  if (invoice.taxRate > 0) {
    row(`Impuesto (${(invoice.taxRate * 100).toLocaleString("es-CO")} %)`, formatCOP(invoice.taxAmount));
  }
  if (invoice.tip > 0) row("Propina", formatCOP(invoice.tip));
  y += 1;
  row("TOTAL", formatCOP(invoice.total), { size: 12, bold: true });
  y += 1;
  row("Método de pago", paymentMethodLabel(invoice.paymentMethod));
  if (invoice.paymentMethod === "efectivo") {
    row("Recibido", formatCOP(invoice.amountReceived));
    row("Cambio", formatCOP(invoice.changeGiven));
  }

  if (invoice.status === "anulada") {
    y += 1;
    divider();
    text("COMPROBANTE ANULADO", { bold: true, align: "center" });
    text(`Motivo: ${invoice.voidReason}`);
    text(`Anulado por: ${invoice.voidedByName ?? "-"} · ${formatDateTime(invoice.voidedAt)}`);
  }

  // Pie
  y += 2;
  divider();
  text("Documento sin validez fiscal", { size: 8, bold: true, align: "center" });
  text("¡Gracias por su visita!", { size: 8, align: "center" });
  return y + 4;
}

function buildReceipt(invoice) {
  // 1.ª pasada en una hoja muy alta para medir; 2.ª con el alto exacto (ticket continuo)
  const probe = new jsPDF({ unit: "mm", format: [TICKET_WIDTH, 2000] });
  const height = Math.max(drawReceipt(probe, invoice), 100);

  const doc = new jsPDF({ unit: "mm", format: [TICKET_WIDTH, height] });
  drawReceipt(doc, invoice);

  if (invoice.status === "anulada") {
    // Marca de agua diagonal semitransparente
    doc.setGState(new doc.GState({ opacity: 0.15 }));
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.setTextColor(200, 0, 0);
    doc.text("ANULADA", TICKET_WIDTH / 2, height / 2, { align: "center", angle: 45 });
    doc.setGState(new doc.GState({ opacity: 1 }));
    doc.setTextColor(0, 0, 0);
  }
  return doc;
}

// Abre el ticket en una pestaña con el diálogo de impresión; si el navegador bloquea la
// ventana emergente, lo descarga.
export function printReceiptPdf(invoice) {
  const doc = buildReceipt(invoice);
  doc.setProperties({ title: `Comprobante de venta ${invoice.invoiceNumber}` });
  doc.autoPrint();
  const win = window.open(doc.output("bloburl"), "_blank");
  if (!win) doc.save(`comprobante-${invoice.invoiceNumber}.pdf`);
}

// El listado no trae los ítems: el PDF se arma con el detalle completo
export async function printInvoiceById(id) {
  try {
    printReceiptPdf(await getInvoiceById(id));
  } catch (error) {
    showSystemErrorAlert({ text: error.message || "No se pudo generar el PDF del comprobante." });
  }
}

// ─────────────────────────── Reporte ───────────────────────────
export const INVOICE_REPORT_FIELDS = [
  { key: "invoiceNumber", label: "Número", default: true },
  { key: "createdAt", label: "Fecha/hora", default: true, format: formatDateTime },
  { key: "tableNumber", label: "Mesa", default: true },
  { key: "waiter", label: "Mesero", default: false },
  { key: "cashier", label: "Cajero", default: true },
  { key: "customerName", label: "Cliente", default: false },
  { key: "paymentMethod", label: "Método", default: true, format: paymentMethodLabel },
  { key: "subtotal", label: "Subtotal", default: false, money: true },
  { key: "taxAmount", label: "Impuesto", default: false, money: true },
  { key: "tip", label: "Propina", default: false, money: true },
  { key: "total", label: "Total", default: true, money: true },
  { key: "status", label: "Estado", default: true, format: (v) => INVOICE_STATUSES.find((s) => s.value === v)?.label ?? v },
];

const describeFilters = ({ from, to, paymentMethod, status }) =>
  [
    from || to ? `Fechas: ${from || "inicio"} a ${to || "hoy"}` : "Todas las fechas",
    paymentMethod ? `Método: ${paymentMethodLabel(paymentMethod)}` : null,
    status ? `Estado: ${status}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

/**
 * Genera el reporte con los totales agregados de /api/invoices/report-data.
 * Devuelve false si no hay datos para los filtros elegidos.
 */
export async function generateInvoiceReport({ format, selectedFields, filters }) {
  const { invoices, totals } = await getInvoiceReportData(filters);
  if (!invoices.length) return false;

  // En Excel los montos van como número (se pueden sumar); en PDF, formateados
  const cell = (field, invoice, forExcel) => {
    const value = invoice[field.key];
    if (field.money) return forExcel ? value : formatCOP(value);
    return field.format ? field.format(value) : value ?? "";
  };
  const headers = selectedFields.map((f) => f.label);
  const summary = [
    ["Comprobantes", totals.count],
    ["Emitidos", totals.issuedCount],
    ["Anulados", totals.voidedCount],
    ["Total vendido (emitidos)", totals.totalSold],
    ["Impuestos", totals.totalTax],
    ["Propinas", totals.totalTips],
  ];
  const byMethod = totals.byPaymentMethod.map((m) => [paymentMethodLabel(m.paymentMethod), m.count, m.total]);
  const byDay = totals.byDay.map((d) => [d.day.split("-").reverse().join("/"), d.count, d.total]);
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "excel") {
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      book,
      XLSX.utils.aoa_to_sheet([headers, ...invoices.map((i) => selectedFields.map((f) => cell(f, i, true)))]),
      "Comprobantes"
    );
    XLSX.utils.book_append_sheet(
      book,
      XLSX.utils.aoa_to_sheet([
        ["Comprobantes de venta — documento sin validez fiscal"],
        [describeFilters(filters)],
        [],
        ...summary,
        [],
        ["Método de pago", "Comprobantes", "Total"],
        ...byMethod,
        [],
        ["Día", "Comprobantes", "Total"],
        ...byDay,
      ]),
      "Totales"
    );
    XLSX.writeFile(book, `reporte-comprobantes-${stamp}.xlsx`);
    return true;
  }

  const doc = new jsPDF({ orientation: selectedFields.length > 7 ? "landscape" : "portrait" });
  doc.setFontSize(16);
  doc.text("Reporte de comprobantes de venta", 14, 18);
  doc.setFontSize(9);
  doc.text(`${describeFilters(filters)} · Documento sin validez fiscal`, 14, 25);

  const head = { fillColor: [33, 150, 243], textColor: 255, fontSize: 9 };
  autoTable(doc, {
    startY: 30,
    head: [headers],
    body: invoices.map((i) => selectedFields.map((f) => cell(f, i, false))),
    theme: "grid",
    headStyles: head,
    styles: { fontSize: 8, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });

  const money = (rows) => rows.map(([a, b, c]) => [a, b, formatCOP(c)]);
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [["Resumen", "Valor"]],
    body: summary.map(([label, value], idx) => [label, idx >= 3 ? formatCOP(value) : value]),
    theme: "grid",
    headStyles: head,
    styles: { fontSize: 9 },
    tableWidth: 90,
    margin: { left: 14 },
  });
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 6,
    head: [["Método de pago", "Comprobantes", "Total"]],
    body: money(byMethod),
    theme: "grid",
    headStyles: head,
    styles: { fontSize: 9 },
    tableWidth: 120,
    margin: { left: 14 },
  });
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 6,
    head: [["Día", "Comprobantes", "Total"]],
    body: money(byDay),
    theme: "grid",
    headStyles: head,
    styles: { fontSize: 9 },
    tableWidth: 120,
    margin: { left: 14 },
  });

  doc.save(`reporte-comprobantes-${stamp}.pdf`);
  return true;
}
