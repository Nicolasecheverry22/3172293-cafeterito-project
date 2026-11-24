import { createPortal } from "react-dom";
import { useState } from "react";
import useDialogA11y from "@/shared/hooks/useDialogA11y";

// Componentes UI reutilizables
import { Button, Select } from "@/shared";
import Checkbox from "@/shared/components/Checkbox";

// Caso de uso conectado al backend
import { generateInventoryReport } from "../services/generateInventoryReport";

// Alertas del servicio
import {
  showSuccessAlert,
  showSystemErrorAlert,
  showCreateErrorAlert,
  showDeleteCancelAlert,
  showConfirmDeleteAlert
} from "@/shared/services/alertService";

export default function ReportConfigModal({ isOpen, onClose }) {
  const [format, setFormat] = useState("pdf");
  const [scope, setScope] = useState("all");
  const [category, setCategory] = useState("");
  // "" y no "Activo": selectedStatus se envía siempre, y el antiguo useEffect lo vaciaba
  // al montar (scope = "all"). Así se conserva ese comportamiento sin el efecto.
  const [status, setStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const inventoryReportFields = [
    { key: "provisionName", label: "Suministro", default: true },
    { key: "category", label: "Categoría", default: true },
    { key: "stock", label: "Stock", default: true },
    { key: "unit", label: "Unidad", default: true },
    { key: "price", label: "Precio", default: true },
    { key: "status", label: "Estado", default: true },
  ];

  const [selectedFields, setSelectedFields] = useState(() =>
    inventoryReportFields.filter((f) => f.default)
  );

  // Al cambiar el alcance se limpian los filtros que ya no aplican. Antes se hacía en un
  // useEffect (setState dentro de un efecto = render extra; lo marca react-hooks).
  const handleScopeChange = (value) => {
    setScope(value);
    if (value !== "category") setCategory("");
    if (value !== "status") setStatus("");
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
        text: "Debes elegir al menos un campo para generar el reporte.",
      });
      return;
    }

    if (scope === "category" && !category) {
      showCreateErrorAlert({
        entity: "categoría",
        text: "Debes ingresar o seleccionar una categoría para filtrar el reporte.",
      });
      return;
    }

    if (scope === "status" && !status) {
      showCreateErrorAlert({
        entity: "estado",
        text: "Debes seleccionar un estado para filtrar el reporte.",
      });
      return;
    }

    setIsGenerating(true);

    try {
      await generateInventoryReport({
        format,
        selectedFields,
        scope,
        selectedCategory: category,
        selectedStatus: status,
      });

      await showSuccessAlert({
        title: "¡Reporte generado!",
        text: "El reporte de inventario fue generado correctamente.",
      });

      onClose();
    } catch (error) {
      console.error("Error al generar el reporte de inventario:", error);
      await showSystemErrorAlert({
        text: "No fue posible generar el reporte de inventario. Intenta nuevamente.",
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
          Generar reporte de inventario
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
            {inventoryReportFields.map((field) => {
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
              { label: "Todo el inventario", value: "all" },
              { label: "Filtrar por categoría", value: "category" },
              { label: "Filtrar por estado", value: "status" },
            ]}
          />
        </div>

        {/* Filtro por Categoría */}
        {scope === "category" && (
          <div className="mb-4">
            <Select
              label="Categoría"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { label: "Seleccione una categoría", value: "" },
                { label: "Carnes", value: "Carnes" },
                { label: "Lácteos", value: "Lácteos" },
                { label: "Bebidas", value: "Bebidas" },
              ]}
            />
          </div>
        )}

        {/* Filtro por Estado */}
        {scope === "status" && (
          <div className="mb-4">
            <Select
              label="Estado"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { label: "Activo", value: "Activo" },
                { label: "Vencido", value: "Vencido" },
                { label: "Averia", value: "Averia" },
              ]}
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
