import { useState, useEffect } from "react";

import { providerReportFields } from "../config/providerReportFields";
import { generateProviderReport } from "../services/generateProviderReport";

import { Button, Input, Select } from "@/shared";
import Checkbox from "@/shared/components/Checkbox";

export default function ReportConfigModal({ isOpen, onClose }) {

  const [format, setFormat] = useState("pdf");
  const [scope, setScope] = useState("all");
  const [documentNumber, setDocumentNumber] = useState("");

  const [selectedFields, setSelectedFields] = useState(() =>
    providerReportFields.filter((f) => f.default)
  );

  useEffect(() => {
    if (scope !== "document") {
      setDocumentNumber("");
    }
  }, [scope]);

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

    if (scope === "document" && !documentNumber.trim()) {
      alert("Debes ingresar un número de documento");
      return;
    }

    generateProviderReport({
      format,
      selectedFields,
      scope,
      documentNumber
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">

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
              { label: "Excel", value: "excel" }
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
            onChange={(e) => setScope(e.target.value)}
            options={[
              { label: "Todos los proveedores", value: "all" },
              { label: "Filtrar por documento", value: "document" }
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