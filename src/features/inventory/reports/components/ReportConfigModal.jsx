import { useState, useEffect } from "react";

import { Button, Input, Select } from "@/shared";
import Checkbox from "@/shared/components/Checkbox";

import { generateInventoryReport } from "../services/generateInventoryReport";
import { inventory } from "../../data/inventory";

export default function ReportConfigModal({ isOpen, onClose }) {
  const [format, setFormat] = useState("pdf");
  const [scope, setScope] = useState("all");
  const [category, setCategory] = useState("");

  const inventoryReportFields = [
    { key: "productName", label: "Producto", default: true },
    { key: "category", label: "Categoría", default: true },
    { key: "stock", label: "Stock", default: true },
    { key: "unit", label: "Unidad", default: true },
    { key: "price", label: "Precio", default: true },
  ];

  const [selectedFields, setSelectedFields] = useState(() =>
    inventoryReportFields.filter((f) => f.default)
  );

  useEffect(() => {
    if (scope !== "category") {
      setCategory("");
    }
  }, [scope]);

  if (!isOpen) return null;

  const categories = [...new Set(inventory.map((i) => i.category))];

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

    generateInventoryReport({
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
            onChange={(e) => setScope(e.target.value)}
            options={[
              { label: "Todo el inventario", value: "all" },
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