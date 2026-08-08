import { useState } from "react";
import { Button, Select } from "@/shared";
import Checkbox from "@/shared/components/Checkbox";

import { generateOrdersReport } from "../services/generateOrdensReport";

export default function ReportConfigModal({ isOpen, onClose }) {
  const [format, setFormat] = useState("pdf");
  const [scope, setScope] = useState("all");
  const [tableNumber, setTableNumber] = useState("");

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
      setSelectedFields(selectedFields.filter((f) => f.key !== field.key));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  const handleGenerate = () => {
    if (selectedFields.length === 0) {
      alert("Selecciona al menos un campo");
      return;
    }

    if (scope === "table" && !tableNumber) {
      alert("Debes ingresar un número de mesa");
      return;
    }

    // 🔴 AQUÍ ESTÁ LA CONEXIÓN REAL
    generateOrdersReport({
      format,
      selectedFields,
      scope,
      tableNumber,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

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
                label={field.label}
                checked={selectedFields.some((f) => f.key === field.key)}
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
            <input
              type="number"
              placeholder="Número de mesa"
              className="w-full border rounded px-3 py-2"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
            />
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>

          <Button variant="primary" onClick={handleGenerate}>
            Generar reporte
          </Button>
        </div>
      </div>
    </div>
  );
}