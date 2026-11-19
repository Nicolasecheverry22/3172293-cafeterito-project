import { createPortal } from "react-dom";
import { useState } from "react";
import useDialogA11y from "@/shared/hooks/useDialogA11y";


import { Button, Input, Select } from "@/shared";
import Checkbox from "@/shared/components/Checkbox";

import { generateOrdersReport } from "../services/generateOrdensReport";

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
  const [tableNumber, setTableNumber] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const orderFields = [
    { key: "id", label: "Orden", default: true },
    { key: "tableNumber", label: "Mesa", default: true },
    { key: "waiter", label: "Encargado", default: true },
    { key: "total", label: "Total", default: true },
    { key: "status", label: "Estado", default: true },
  ];

  const [selectedFields, setSelectedFields] = useState(() =>
    orderFields.filter((f) => f.default)
  );

  // Al cambiar el alcance se limpian los filtros que ya no aplican. Antes se hacía en un
  // useEffect (setState dentro de un efecto = render extra; lo marca react-hooks).
  const handleScopeChange = (value) => {
    setScope(value);
    if (value !== "table") setTableNumber("");
  };

  // Escape, foco inicial, Tab atrapado y foco devuelto al cerrar
  const dialogRef = useDialogA11y(isOpen, onClose);

  if (!isOpen) return null;

  const handleFieldToggle = (field) => {
    const exists = selectedFields.find((f) => f.key === field.key);

    if (exists) {
      setSelectedFields(
        selectedFields.filter((f) => f.key !== field.key)
      );
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  const handleGenerate = async () => {
    if (selectedFields.length === 0) {
      showCreateErrorAlert({
        entity: "reporte",
        text: "Debes elegir al menos un campo para generar el reporte.",
      });

      return;
    }

    if (scope === "table" && !tableNumber.trim()) {
      showCreateErrorAlert({
        entity: "mesa",
        text: "Debes ingresar un número de mesa para filtrar el reporte.",
      });

      return;
    }

    setIsGenerating(true);

    try {
      await generateOrdersReport({
        format,
        selectedFields,
        scope,
        tableNumber,
      });

      await showSuccessAlert({
        title: "¡Reporte generado!",
        text: "El reporte de órdenes fue generado correctamente.",
      });

      onClose();
    } catch (error) {
      console.error("Error al generar el reporte de órdenes:", error);

      await showSystemErrorAlert({
        text: "No fue posible generar el reporte de órdenes. Intenta nuevamente.",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div ref={dialogRef} role="dialog" aria-modal="true" tabIndex={-1} className="w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-shape-xl bg-surface/90 text-text-primary p-6 shadow-elevation-3 dark:bg-surface/95">
        <h2 className="mb-6 text-xl font-semibold">
          Generar reporte de órdenes
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
            {orderFields.map((field) => (
              <Checkbox
                key={field.key}
                id={field.key}
                name={field.key}
                label={field.label}
                checked={selectedFields.some(
                  (f) => f.key === field.key
                )}
                onChange={() => handleFieldToggle(field)}
              />
            ))}
          </div>
        </div>

        {/* Alcance */}
        <div className="mb-4">
          <Select
            label="Alcance del reporte"
            value={scope}
            onChange={(e) => handleScopeChange(e.target.value)}
            options={[
              { label: "Todas las órdenes", value: "all" },
              { label: "Filtrar por mesa", value: "table" },
            ]}
          />
        </div>

        {/* Filtro mesa */}
        {scope === "table" && (
          <div className="mb-4">
            <Input
              label="Número de mesa"
              type="number"
              placeholder="Ingrese número de mesa"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
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
            onClick={handleGenerate}
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
