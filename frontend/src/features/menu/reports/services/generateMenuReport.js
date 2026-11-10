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
    let url = "http://localhost:4000/api/products/report-data";

    if (scope === "category" && selectedCategory) {
      url += `?category=${encodeURIComponent(selectedCategory)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error al obtener los datos del menú desde el servidor.");
    }

    const products = await response.json();

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