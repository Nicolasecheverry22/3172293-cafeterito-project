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
    // URL del endpoint del backend para reportes de inventario
    let url = "http://localhost:4000/api/inventory/report-data";

    const params = new URLSearchParams();
    if (scope === "category" && selectedCategory) {
      params.append("category", selectedCategory);
    } else if (scope === "status" && selectedStatus) {
      params.append("status", selectedStatus);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    // Petición al backend
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error al obtener los datos del inventario desde el servidor.");
    }

    const items = await response.json();

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