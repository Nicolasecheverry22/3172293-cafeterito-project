import { generateExcelReport } from "./generateExcelReport";
import { generatePdfReport } from "./generatePdfReport";
import { buildOrdersReportDataset } from "../utils/buildReportDataset";
import { ordens } from "../../data/ordens";

export function generateOrdersReport({
  format,
  selectedFields,
  scope,
  tableNumber,
}) {
  let filteredData = ordens;

  if (scope === "table" && tableNumber) {
    filteredData = ordens.filter(
      (order) => order.tableNumber === Number(tableNumber)
    );
  }

  const { headers, rows } = buildOrdersReportDataset({
    data: filteredData,
    selectedFields,
  });

  if (!rows.length) {
    alert("No hay datos para generar el reporte.");
    return;
  }

  // 🔴 DEBUG
  console.log("Generando reporte:", format);

  if (format === "excel") {
    generateExcelReport({
      headers,
      rows,
      fileName: "reporte_ordenes.xlsx",
    });
    return;
  }

  if (format === "pdf") {
    generatePdfReport({
      headers,
      rows,
      fileName: "reporte_ordenes.pdf",
    });
    return;
  }

  // fallback por si algo falla
  console.error("Formato no reconocido:", format);
}