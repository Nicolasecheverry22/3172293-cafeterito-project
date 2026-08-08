import { generateExcelReport } from "./generateExcelReport";
import { generatePdfReport } from "./generatePdfReport";
import { buildReportDataset } from "../utils/buildReportDataset";
import { inventory } from "../../data/inventory";

export function generateInventoryReport({
  format,
  selectedFields,
  scope,
  selectedCategory,
}) {
  let filteredData = inventory;

  // 🔴 FILTRO REAL
  if (scope === "category") {
    filteredData = inventory.filter(
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
      fileName: "reporte_inventario.xlsx",
    });
  }

  if (format === "pdf") {
    generatePdfReport({
      headers,
      rows,
      fileName: "reporte_inventario.pdf",
    });
  }
}