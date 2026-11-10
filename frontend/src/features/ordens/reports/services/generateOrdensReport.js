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
    let url = "http://localhost:4000/api/orders/report-data";

    if (scope === "table" && tableNumber) {
      url += `?tableNumber=${encodeURIComponent(tableNumber)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error al obtener los datos de las órdenes desde el servidor.");
    }

    const orders = await response.json();

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