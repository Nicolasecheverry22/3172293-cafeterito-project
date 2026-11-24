// Mismo patrón que los ReportConfigModal de los demás módulos (formato + campos + alcance),
// con los totales agregados de /api/invoices/report-data.
import { createPortal } from "react-dom";
import { useState } from "react";
import useDialogA11y from "@/shared/hooks/useDialogA11y";
import { Button, Select } from "@/shared";
import Checkbox from "@/shared/components/Checkbox";
import { generateInvoiceReport, INVOICE_REPORT_FIELDS } from "../utils/invoicePdf";
import {
  showSuccessAlert,
  showCreateErrorAlert,
  showSystemErrorAlert,
} from "@/shared/services/alertService";

// filters: los filtros activos del listado (fechas, método, estado) — el reporte usa los mismos
export default function ReportConfigModal({ isOpen, onClose, filters }) {
  const [format, setFormat] = useState("pdf");
  const [scope, setScope] = useState("filtered");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFields, setSelectedFields] = useState(() => INVOICE_REPORT_FIELDS.filter((f) => f.default));

  const dialogRef = useDialogA11y(isOpen, onClose);
  if (!isOpen) return null;

  const toggleField = (field) =>
    setSelectedFields((prev) =>
      prev.some((f) => f.key === field.key)
        ? prev.filter((f) => f.key !== field.key)
        // Conserva el orden de columnas de INVOICE_REPORT_FIELDS
        : INVOICE_REPORT_FIELDS.filter((f) => f.key === field.key || prev.some((p) => p.key === f.key))
    );

  const handleGenerate = async () => {
    if (selectedFields.length === 0) {
      showCreateErrorAlert({ entity: "reporte", text: "Debes elegir al menos un campo para generar el reporte." });
      return;
    }
    setIsGenerating(true);
    try {
      const generated = await generateInvoiceReport({
        format,
        selectedFields,
        filters: scope === "filtered" ? filters : {},
      });
      if (!generated) {
        await showCreateErrorAlert({
          title: "Sin datos",
          text: "No hay comprobantes de venta con los criterios seleccionados.",
        });
        return;
      }
      await showSuccessAlert({ title: "¡Reporte generado!", text: "El reporte de comprobantes fue generado correctamente." });
      onClose();
    } catch (error) {
      console.error("Error al generar el reporte de comprobantes:", error);
      await showSystemErrorAlert({ text: "No fue posible generar el reporte de comprobantes. Intenta nuevamente." });
    } finally {
      setIsGenerating(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-report-title"
        tabIndex={-1}
        className="w-full max-w-lg h-dvh max-h-dvh sm:h-auto sm:max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-none sm:rounded-shape-xl bg-background text-text-primary p-6 shadow-elevation-3"
      >
        <h2 id="invoice-report-title" className="mb-6 text-xl font-semibold">
          Generar reporte de comprobantes
        </h2>

        <div className="mb-4">
          <Select
            label="Formato del reporte"
            htmlFor="invoice-report-format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            options={[
              { label: "PDF", value: "pdf" },
              { label: "Excel", value: "excel" },
            ]}
          />
        </div>

        <div className="mb-4">
          <p className="mb-2 font-medium">Campos del reporte</p>
          <div className="grid grid-cols-2 gap-2">
            {INVOICE_REPORT_FIELDS.map((field) => (
              <Checkbox
                key={field.key}
                id={`invoice-report-${field.key}`}
                name={field.key}
                label={field.label}
                checked={selectedFields.some((f) => f.key === field.key)}
                onChange={() => toggleField(field)}
              />
            ))}
          </div>
        </div>

        <div className="mb-2">
          <Select
            label="Alcance del reporte"
            htmlFor="invoice-report-scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            options={[
              { label: "Filtros actuales del listado", value: "filtered" },
              { label: "Todos los comprobantes", value: "all" },
            ]}
          />
        </div>
        <p className="mb-4 text-small text-text-secondary">
          Incluye totales por método de pago y por día. Los montos suman solo comprobantes emitidos.
        </p>

        <div className="flex flex-wrap justify-end gap-2 mt-6 max-sm:flex-col-reverse max-sm:*:w-full">
          <Button variant="secondary" onClick={onClose} disabled={isGenerating}>Cancelar</Button>
          <Button variant="primary" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? "Generando..." : "Generar reporte"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
