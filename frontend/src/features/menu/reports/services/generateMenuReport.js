import { api } from "@/services/apiClient";
import { generateExcelReport } from "./generateExcelReport";
import { generatePdfReport } from "./generatePdfReport";
import { buildReportDataset } from "../utils/buildReportDataset";

export async function generateMenuReport({
  format,
  selectedFields,
  scope,
  selectedCategory,
}) {
  try {
    const query = scope === "category" && selectedCategory ? { category: selectedCategory } : {};
    const products = await api.get("/products/report-data", { query });

    if (!products || !products.length) {
      alert("No hay datos para generar el reporte con los criterios seleccionados.");
      return;
    }

    // Normalización estricta de la disponibilidad
    const formattedProducts = products.map((item) => {
      const activeValue = item.isAvailable;
      const isAvailable = 
        activeValue === true || 
        activeValue === "true" || 
        activeValue === 1 || 
        activeValue === "Disponible";

      return {
        ...item,
        isAvailable: isAvailable ? "Disponible" : "No disponible",
      };
    });

    const { headers, rows } = buildReportDataset({
      data: formattedProducts,
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
        fileName: `reporte-platillos-${timestamp}.xlsx`,
      });
    }

    if (format === "pdf") {
      generatePdfReport({
        headers,
        rows,
        fileName: `reporte-platillos-${timestamp}.pdf`,
      });
    }
  } catch (error) {
    console.error("Error en generateMenuReport:", error);
    throw error;
  }
}