import { useState } from "react"

// Configuración de campos disponibles para el reporte
import { userReportFields } from "../config/userReportFields";

// Caso de uso que orquesta la generación del reporte
import { generateUserReport } from "../services/generateUserReport";

// Componentes UI reutilizables (design system)
import { Button, Input, Select } from "@/shared";
import Checkbox from "@/shared/components/Checkbox";

// Componente modal para configuración de reportes
export default function ReportConfigModal({ isOpen, onClose }) {

  // Estado del formato de salida
  const [format, setFormat] = useState("pdf");

  // Estado del alcance del reporte
  const [scope, setScope] = useState("all");

  // Estado para filtro por documento
  const [documentNumber, setDocumentNumber] = useState("");

  // Estado de campos seleccionados
  const [selectedFields, setSelectedFields] = useState(() =>
    userReportFields.filter((f) => f.default)
  );

  // Evita render si el modal está cerrado
  if (!isOpen) return null;

  // Toggle de campos
  const handleFieldToggle = (field) => {
    const exists = selectedFields.find((f) => f.key === field.key);

    if (exists) {
      setSelectedFields(selectedFields.filter((f) => f.key !== field.key));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  // Generar reporte
  const handleGenerateReport = () => {
    generateUserReport({
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
          Generar reporte de usuarios
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
            {userReportFields.map((field) => {
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
              { label: "Todos los usuarios", value: "all" },
              { label: "Filtrar por documento", value: "document" }
            ]}
          />
        </div>

        {/* Filtro por documento */}
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