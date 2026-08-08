import { useState, useEffect } from "react";

import { Button, Input, Select } from "@/shared";
import Checkbox from "@/shared/components/Checkbox";

import { generateMenuReport } from "../services/generateMenuReport";
import { menu } from "../../data/menu";

export default function ReportConfigModal({ isOpen, onClose }) {
  const [format, setFormat] = useState("pdf");
  const [scope, setScope] = useState("all");
  const [category, setCategory] = useState("");

  const menuReportFields = [
    { key: "productName", label: "Producto", default: true },
    { key: "category", label: "Categoría", default: true },
    { key: "price", label: "Precio", default: true },
    { key: "isAvailable", label: "Disponible", default: true },
  ];

  const [selectedFields, setSelectedFields] = useState(() =>
    menuReportFields.filter((f) => f.default)
  );

  // 🔴 MISMO PATRÓN QUE PROVIDERS
  useEffect(() => {
    if (scope !== "category") {
      setCategory("");
    }
  }, [scope]);

  if (!isOpen) return null;

  // ✅ categorías dinámicas
  const categories = [...new Set(menu.map((item) => item.category))];

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

    if (scope === "category" && !category) {
      alert("Debes seleccionar una categoría");
      return;
    }

    generateMenuReport({
      format,
      selectedFields,
      scope,
      selectedCategory: category,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg w-[500px]">
        <h2 className="mb-6 text-xl font-semibold">
          Generar reporte de menú
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
            {menuReportFields.map((field) => {
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
              { label: "Todo el menú", value: "all" },
              { label: "Filtrar por categoría", value: "category" },
            ]}
          />
        </div>

        {/* Filtro */}
        {scope === "category" && (
          <div className="mb-4">
            <Select
              label="Categoría"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { label: "Seleccione una categoría", value: "" },
                ...categories.map((cat) => ({
                  label: cat,
                  value: cat,
                })),
              ]}
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