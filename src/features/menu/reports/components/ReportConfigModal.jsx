import { useState, useEffect } from "react";
import Swal from "sweetalert2";

import { Button, Select } from "@/shared";
import Checkbox from "@/shared/components/Checkbox";

import { generateMenuReport } from "../services/generateMenuReport";
import { menu } from "../../data/menu";

import {
  showSuccessAlert,
  showCreateErrorAlert,
  showSystemErrorAlert,
  showDeleteCancelAlert,
} from "@/shared/services/alertService";

export default function ReportConfigModal({ isOpen, onClose }) {
  const [format, setFormat] = useState("pdf");
  const [scope, setScope] = useState("all");
  const [category, setCategory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const menuReportFields = [
    { key: "productName", label: "Producto", default: true },
    { key: "category", label: "Categoría", default: true },
    { key: "price", label: "Precio", default: true },
    { key: "isAvailable", label: "Disponible", default: true },
  ];

  const [selectedFields, setSelectedFields] = useState(() =>
    menuReportFields.filter((f) => f.default)
  );

  // Limpia la categoría cuando el reporte no está filtrado por categoría
  useEffect(() => {
    if (scope !== "category") {
      setCategory("");
    }
  }, [scope]);

  if (!isOpen) return null;

  // Categorías dinámicas a partir de los datos del menú
  const categories = [...new Set(menu.map((item) => item.category))];

  const handleFieldToggle = (field) => {
    setSelectedFields((prev) => {
      const exists = prev.find((f) => f.key === field.key);

      if (exists) {
        return prev.filter((f) => f.key !== field.key);
      }

      return [...prev, field];
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
        text: "Debes seleccionar una categoría para filtrar el reporte.",
      });

      return;
    }

    setIsGenerating(true);

    try {
      await generateMenuReport({
        format,
        selectedFields,
        scope,
        selectedCategory: category,
      });

      await showSuccessAlert({
        title: "¡Reporte generado!",
        text: "El reporte del menú fue generado correctamente.",
      });

      onClose();
    } catch (error) {
      console.error("Error al generar el reporte del menú:", error);

      await showSystemErrorAlert({
        text: "No fue posible generar el reporte del menú. Intenta nuevamente.",
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

        {/* Filtro por categoría */}
        {scope === "category" && (
          <div className="mb-4">
            <Select
              label="Categoría"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                {
                  label: "Seleccione una categoría",
                  value: "",
                },
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
    </div>
  );
}