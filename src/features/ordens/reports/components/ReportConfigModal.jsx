import { useState } from "react";
import { Button, Input, Select } from "@/shared";
import Checkbox from "@/shared/components/Checkbox";

import { generateOrdersReport } from "../services/generateOrdensReport";

import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmDeleteAlert,
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

  const [selectedFields, setSelectedFields] = useState(
    orderFields.filter((f) => f.default)
  );

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
      await showErrorAlert({
        title: "Selecciona al menos un campo",
        text: "Debes elegir al menos un campo para generar el reporte.",
      });

      return;
    }

    if (scope === "table" && !tableNumber.trim()) {
      await showErrorAlert({
        title: "Número de mesa requerido",
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
        title: "Reporte generado",
        text: "El reporte de órdenes fue generado correctamente.",
        timer: 2000,
      });

      onClose();
    } catch (error) {
      console.error("Error al generar el reporte de órdenes:", error);

      await showErrorAlert({
        title: "Error al generar el reporte",
        text: "No fue posible generar el reporte de órdenes. Intenta nuevamente.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancel = async () => {
    if (isGenerating) return;

    const result = await showConfirmDeleteAlert({
      title: "¿Cancelar configuración?",
      text: "La configuración del reporte no se guardará.",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Continuar configurando",
    });

    if (result.isConfirmed) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={handleCancel}
      />

      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6 z-10">
        <h2 className="text-xl font-semibold mb-4">
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
            onChange={(e) => setScope(e.target.value)}
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
        <div className="flex justify-end gap-2 mt-6">
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
    </div>
  );
}
