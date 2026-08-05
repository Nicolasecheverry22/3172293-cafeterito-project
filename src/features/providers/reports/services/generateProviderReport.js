import { generateExcelReport } from "./generateExcelReport";
import { generatePdfReport } from "./generatePdfReport";
import { providers } from "../../data/providers";

export function generateProviderReport({
  format,
  selectedFields,
  scope,
  documentNumber,
}) {
  let filteredProviders = [...providers];

  // ✅ filtro por documento
  if (scope === "document") {
    filteredProviders = filteredProviders.filter(
      (p) => p.documentNumber === documentNumber
    );
  }

  // ✅ validación
  if (!filteredProviders.length) {
    alert("No hay datos para generar el reporte.");
    return;
  }

  // ✅ Excel
  if (format === "excel") {
    generateExcelReport({
      data: filteredProviders,
      selectedFields,
      fileName: "reporte_proveedores.xlsx",
      sheetName: "Proveedores"
    });
  }

  // ✅ PDF
  if (format === "pdf") {
    generatePdfReport({
      data: filteredProviders,
      selectedFields,
      fileName: "reporte_proveedores.pdf",
      title: "Reporte de Proveedores"
    });
  }
}