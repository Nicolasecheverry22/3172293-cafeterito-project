import { useState, useEffect } from "react";
import Swal from "sweetalert2";

import { Button, Input, Select } from "@/shared";
import Checkbox from "@/shared/components/Checkbox";

import { generateOrdersReport } from "../services/generateOrdensReport";

import {
  showSuccessAlert,
  showCreateErrorAlert,
  showSystemErrorAlert,
  showDeleteCancelAlert,
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

  useEffect(() => {
    if (scope !== "table") {
      setTableNumber("");
    }
  }, [scope]);

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

    const result = await Swal.fire({
      title: "¿Cancelar configuración?",
      text: "La configuración del reporte no se guardará.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Continuar configurando",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl",
        title: "!text-amber-600 font-bold",
        confirmButton:
          "!bg-red-600 hover:!bg-red-700 text-white cursor-pointer px-4 py-2 rounded-lg ml-2 font-medium",
        cancelButton:
          "!bg-gray-500 hover:!bg-gray-600 text-white cursor-pointer px-4 py-2 rounded-lg font-medium",
      },
      buttonsStyling: false,
    });

    if (result.isConfirmed) {
      showDeleteCancelAlert({
        title: "Configuración cancelada",
        text: "No se generó el reporte.",
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
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