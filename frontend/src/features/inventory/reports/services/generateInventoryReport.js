import { api } from "@/services/apiClient";
import { generateExcelReport } from "./generateExcelReport";
import { generatePdfReport } from "./generatePdfReport";
import { buildReportDataset } from "../utils/buildReportDataset";

export async function generateInventoryReport({
  format,
  selectedFields,
  scope,
  selectedCategory,
  selectedStatus,
}) {
  try {
    // Petición autenticada al backend (GET /api/inventory/report-data)
    const query = {};
    if (scope === "category" && selectedCategory) {
      query.category = selectedCategory;
    } else if (scope === "status" && selectedStatus) {
      query.status = selectedStatus;
    }

    const items = await api.get("/inventory/report-data", { query });

    if (!items || !items.length) {
      alert("No hay datos para generar el reporte con los criterios seleccionados.");
      return;
    }

    const { headers, rows } = buildReportDataset({
      data: items,
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
        fileName: `reporte-suministros-${timestamp}.xlsx`,
      });
    } else if (format === "pdf") {
      generatePdfReport({
        headers,
        rows,
        fileName: `reporte-suministros-${timestamp}.pdf`,
      });
    }
  } catch (error) {
    console.error("Error en generateInventoryReport:", error);
    throw error;
  }
}