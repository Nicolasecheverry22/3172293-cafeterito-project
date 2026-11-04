import { generateExcelReport } from "./generateExcelReport";
import { generatePdfReport } from "./generatePdfReport";
import { providers } from "../../data/providers";
import { buildReportDataset } from "../utils/buildReportDataset";

export function generateProviderReport({
  format,
  selectedFields,
  scope,
  documentNumber,
}) {
  const dataset = buildReportDataset({
    providers,
    selectedFields,
    scope,
    documentNumber,
  });

  if (!dataset.rows.length) {
    alert("No hay datos para generar el reporte.");
    return;
  }

  if (format === "excel") {
    generateExcelReport({
      headers: dataset.headers,
      rows: dataset.rows,
      fileName: "reporte_proveedores.xlsx",
      sheetName: "Proveedores",
    });
  }

  if (format === "pdf") {
    generatePdfReport({
      headers: dataset.headers,
      rows: dataset.rows,
      fileName: "reporte_proveedores.pdf",
      title: "Reporte de Proveedores",
    });
  }
}