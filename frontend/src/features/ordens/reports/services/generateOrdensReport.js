import { api } from "@/services/apiClient";
import { generateExcelReport } from "./generateExcelReport";
import { generatePdfReport } from "./generatePdfReport";
import { buildOrdersReportDataset } from "../utils/buildReportDataset";

export async function generateOrdersReport({
  format,
  selectedFields,
  scope,
  tableNumber,
}) {
  try {
    const query = scope === "table" && tableNumber ? { tableNumber } : {};
    const orders = await api.get("/orders/report-data", { query });

    if (!orders || !orders.length) {
      alert("No hay datos para generar el reporte con los criterios seleccionados.");
      return;
    }

    const { headers, rows } = buildOrdersReportDataset({
      data: orders,
      selectedFields,
    });

    if (!rows.length) {
      alert("No hay datos para generar el reporte.");
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);

    if (format === "excel") {
      generateExcelReport({
        headers,
        rows,
        fileName: `reportar-ordenes-${timestamp}.xlsx`,
      });
      return;
    }

    if (format === "pdf") {
      generatePdfReport({
        headers,
        rows,
        fileName: `reportar-ordenes-${timestamp}.pdf`,
      });
      return;
    }
  } catch (error) {
    console.error("Error en generateOrdersReport:", error);
    throw error;
  }
}