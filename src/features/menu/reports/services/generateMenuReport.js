import { menu } from "../../data/menu.js";
import { buildReportDataset } from "../utils/buildReportDataset";
import { generateExcelReport } from "./generateExcelReport";
import { generatePdfReport } from "./generatePdfReport";

export const generateMenuReport = (fields, format) => {
  if (!Array.isArray(fields) || fields.length === 0) {
    throw new Error("Debes seleccionar al menos un campo");
  }

  // 🔴 fields ahora son objetos { key, label }
  const dataset = buildReportDataset(menu, fields);

  if (!dataset || dataset.length === 0) {
    throw new Error("No hay datos para generar el reporte");
  }

  if (format === "excel") {
    generateExcelReport(dataset, "menu_report");
  }

  if (format === "pdf") {
    generatePdfReport(dataset, "menu_report");
  }
};