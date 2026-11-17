import { api } from "@/services/apiClient";
import { generateExcelReport } from "./generateExcelReport";
import { generatePdfReport } from "./generatePdfReport";
import { buildReportDataset } from "../utils/buildReportDataset";

export async function generateProviderReport({
  format,
  selectedFields,
  scope,
  documentNumber, // NIT ingresado en el modal
}) {
  try {
    // Si el alcance es por documento (NIT), se envía como query parameter
    const query =
      scope === "document" && documentNumber && documentNumber.trim() !== ""
        ? { nit: documentNumber.trim() }
        : {};

    const providers = await api.get("/providers/report-data", { query });

    if (!providers || !providers.length) {
      alert("No hay datos para generar el reporte con los criterios seleccionados.");
      return;
    }

    // Normalización estricta del estado para que falle o acierte de forma segura
    const formattedProviders = providers.map((provider) => {
      const activeValue = provider.is_active;
      const isActive = 
        activeValue === true || 
        activeValue === "true" || 
        activeValue === 1 || 
        activeValue === "Activo";

      return {
        ...provider,
        is_active: isActive ? "Activo" : "Inactivo",
      };
    });

    const dataset = buildReportDataset({
      providers: formattedProviders,
      selectedFields,
      scope,
      documentNumber,
    });

    if (!dataset.rows.length) {
      alert("No hay datos para generar el reporte.");
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);

    if (format === "excel") {
      generateExcelReport({
        headers: dataset.headers,
        rows: dataset.rows,
        fileName: `reporte-proveedores-${timestamp}.xlsx`,
        sheetName: "Proveedores",
      });
    }

    if (format === "pdf") {
      generatePdfReport({
        headers: dataset.headers,
        rows: dataset.rows,
        fileName: `reporte-proveedores-${timestamp}.pdf`,
        title: "Reporte de Proveedores",
      });
    }
  } catch (error) {
    console.error("Error en generateProviderReport:", error);
    throw error;
  }
}