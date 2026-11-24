import { createPortal } from "react-dom";
import { useState } from "react";
import useDialogA11y from "@/shared/hooks/useDialogA11y";

import { providerReportFields } from "../config/providerReportFields";
import { generateProviderReport } from "../services/generateProviderReport";

import { Button, Input, Select } from "@/shared";
import Checkbox from "@/shared/components/Checkbox";
import {
  showSuccessAlert,
  showCreateErrorAlert,
  showSystemErrorAlert,
  showDeleteCancelAlert,
  showConfirmDeleteAlert
} from "@/shared/services/alertService";

export default function ReportConfigModal({ isOpen, onClose }) {
  const [format, setFormat] = useState("pdf");
  const [scope, setScope] = useState("all");
  const [documentNumber, setDocumentNumber] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedFields, setSelectedFields] = useState(() =>
    providerReportFields.filter((f) => f.default)
  );

  // Al cambiar el alcance se limpian los filtros que ya no aplican. Antes se hacía en un
  // useEffect (setState dentro de un efecto = render extra; lo marca react-hooks).
  const handleScopeChange = (value) => {
    setScope(value);
    if (value !== "document") setDocumentNumber("");
  };

  // Escape, foco inicial, Tab atrapado y foco devuelto al cerrar
  const dialogRef = useDialogA11y(isOpen, onClose);

  if (!isOpen) return null;

  const handleFieldToggle = (field) => {
    setSelectedFields((prev) => {
      const exists = prev.find((f) => f.key === field.key);

      if (exists) {
        return prev.filter((f) => f.key !== field.key);
      } else {
        return [...prev, field];
      }
    });
  };

  const handleGenerateReport = async () => {
    if (selectedFields.length === 0) {
      showCreateErrorAlert({
        entity: "reporte",
        text: "Debes seleccionar al menos un campo para generar el reporte.",
      });
      return;
    }

    if (scope === "document" && !documentNumber.trim()) {
      showCreateErrorAlert({
        entity: "documento",
        text: "Debes ingresar un número de documento para filtrar el reporte.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateProviderReport({
        format,
        selectedFields,
        scope,
        documentNumber,
      });

      await showSuccessAlert({
        title: "¡Reporte generado!",
        text: "El reporte de proveedores fue generado correctamente.",
      });

      onClose();
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      await showSystemErrorAlert({
        text: "No fue posible generar el reporte de proveedores. Intenta nuevamente.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancel = async () => {
    if (isGenerating) return;

    const result = await showConfirmDeleteAlert({
      title: "¿Cancelar Reporte?",
      text: "La configuración del reporte no se guardará.",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Continuar reportando",
    });

    if (result.isConfirmed) {
      showDeleteCancelAlert({
        title: "Configuración cancelada",
        text: "No se generó el reporte.",
      });
      onClose();
    }
  };

  // Portal a <body>: la tarjeta de la página usa backdrop-blur, y backdrop-filter
  // convierte a sus hijos position:fixed en relativos a ella (el modal salía cortado bajo el Navbar)
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4">
      <div ref={dialogRef} role="dialog" aria-modal="true" tabIndex={-1} className="w-full max-w-lg h-dvh max-h-dvh sm:h-auto sm:max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-none sm:rounded-shape-xl bg-background sm:bg-surface/90 text-text-primary p-6 shadow-elevation-3 sm:dark:bg-surface/95">
        <h2 className="mb-6 text-xl font-semibold">
          Generar reporte de proveedores
        </h2>

        {/* Formato */}
        <div className="mb-4">
          <Select
            label="Formato del reporte"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            options={[
              { label: "PDF", value: "pdf" },
              { label: "Excel", value: "excel" },
            ]}
          />
        </div>

        {/* Campos */}
        <div className="mb-4">
          <p className="mb-2 font-medium">Campos del reporte</p>

          <div className="grid grid-cols-2 gap-2">
            {providerReportFields.map((field) => {
              const checked = selectedFields.some(
                (f) => f.key === field.key
              );

              return (
                <Checkbox
                  key={field.key}
                  id={field.key}
                  name={field.key}
                  label={field.label}
                  checked={checked}
                  onChange={() => handleFieldToggle(field)}
                />
              );
            })}
          </div>
        </div>

        {/* Alcance */}
        <div className="mb-4">
          <Select
            label="Alcance del reporte"
            value={scope}
            onChange={(e) => handleScopeChange(e.target.value)}
            options={[
              { label: "Todos los proveedores", value: "all" },
              { label: "Filtrar por documento", value: "document" },
            ]}
          />
        </div>

        {/* Filtro */}
        {scope === "document" && (
          <div className="mb-4">
            <Input
              label="Número de documento"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="Ingrese número de documento"
            />
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-wrap justify-end gap-2 mt-6">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isGenerating}
          >
            Cancelar
          </Button>

          <Button
            variant="primary"
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? "Generando..." : "Generar reporte"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
