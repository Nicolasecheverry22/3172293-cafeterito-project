import { generateExcelReport } from "./generateExcelReport";
import { generatePdfReport } from "./generatePdfReport";
import { buildReportDataset } from "../utils/buildReportDataset";
import { menu } from "../../data/menu";

export function generateMenuReport({
  format,
  selectedFields,
  scope,
  selectedCategory,
}) {
  let filteredData = menu;

  // 🔴 FILTRO REAL (esto no lo tenías)
  if (scope === "category") {
    filteredData = menu.filter(
      (item) => item.category === selectedCategory
    );
  }

  const { headers, rows } = buildReportDataset({
    data: filteredData,
    selectedFields,
  });

  if (!rows.length) {
    alert("No hay datos para generar el reporte.");
    return;
  }

  if (format === "excel") {
    generateExcelReport({
      headers,
      rows,
      fileName: "reporte_menu.xlsx",
    });
  }

  if (format === "pdf") {
    generatePdfReport({
      headers,
      rows,
      fileName: "reporte_menu.pdf",
    });
  }
}