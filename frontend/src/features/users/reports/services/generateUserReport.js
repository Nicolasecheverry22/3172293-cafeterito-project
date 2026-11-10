// Utilidad para transformar datos en dataset de reporte
import { buildReportDataset } from "../utils/buildReportDataset";

// Servicios de exportación
import { generateExcelReport } from "./generateExcelReport";
import { generatePdfReport } from "./generatePdfReport";

// Caso de uso: orquestador de generación de reportes de usuarios conectado al backend
export async function generateUserReport({
  format,          // "excel" | "pdf"
  selectedFields,  // Campos seleccionados por el usuario
  scope,           // Alcance del reporte ("all" | "document")
  documentNumber   // Filtro opcional
}) {
  try {
    let url = "http://localhost:4000/api/users/report-data";

    // Si el alcance es por documento, se envía como Query Parameter de forma segura
    if (scope === "document" && documentNumber && documentNumber.trim() !== "") {
      url += `?document=${encodeURIComponent(documentNumber.trim())}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error al obtener los datos de los usuarios desde el servidor.");
    }
    
    const users = await response.json();

    // Validación: evita generar archivos vacíos
    if (!users || !users.length) {
      alert("No hay datos para generar el reporte con los criterios seleccionados.");
      return;
    }

    // Construcción del dataset
    const { headers, rows } = buildReportDataset({
      users,
      selectedFields,
      scope,
      documentNumber
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
        fileName: `reporte-usuarios-${timestamp}.xlsx`
      });
    } else if (format === "pdf") {
      generatePdfReport({
        headers,
        rows,
        fileName: `reporte-usuarios-${timestamp}.pdf`
      });
    }
  } catch (error) {
    console.error("Error en generateUserReport:", error);
    throw error;
  }
}