import { generateExcelReport } from "./generateExcelReport";
import { generatePdfReport } from "./generatePdfReport";
import { buildReportDataset } from "../utils/buildReportDataset";
import { inventory } from "../../data/inventory";

export function generateInventoryReport({
  format,
  selectedFields,
}) {
  // ✅ usamos el builder (requerido por el instructor)
  const { headers, rows } = buildReportDataset({
    data: inventory,
    selectedFields,
  });

  // ✅ validación
  if (!rows.length) {
    alert("No hay datos para generar el reporte.");
    return;
  }

  // ✅ Excel
  if (format === "excel") {
    generateExcelReport({
      headers,
      rows,
      fileName: "reporte_inventario.xlsx",
    });
  }

  // ✅ PDF
  if (format === "pdf") {
    generatePdfReport({
      headers,
      rows,
      fileName: "reporte_inventario.pdf",
    });
  }
}