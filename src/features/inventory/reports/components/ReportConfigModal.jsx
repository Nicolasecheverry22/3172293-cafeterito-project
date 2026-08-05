import { useState } from "react";

import { inventoryReportFields } from "../config/inventoryReportFields";
import { generateInventoryReport } from "../services/generateInventoryReport";

import { Button, Select } from "@/shared";
import Checkbox from "@/shared/components/Checkbox";

export default function ReportConfigModal({ isOpen, onClose }) {
  const [format, setFormat] = useState("pdf");

  const [selectedFields, setSelectedFields] = useState(() =>
    inventoryReportFields.filter((f) => f.default)
  );

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

  const handleGenerateReport = () => {
    if (selectedFields.length === 0) {
      alert("Debes seleccionar al menos un campo");
      return;
    }

    generateInventoryReport({
      format,
      selectedFields
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">

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
              { label: "Excel", value: "excel" }
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

        {/* Acciones */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>

          <Button variant="primary" onClick={handleGenerateReport}>
            Generar reporte
          </Button>
        </div>
      </div>
    </div>
  );
}