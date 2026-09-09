import { useState } from "react";
import { Input, Select, Button, FileInput, StatusSwitch } from "@/shared";
import { createMenuSchema } from "../schemas/menuSchema";
import { menuCategories } from "../data/categories";

const DEFAULT_FORM_DATA = {
  nombre: "",
  precio: "",
  categoria: "",
  descripcion: "",
  estado: true,
  imagen: [],
};

export default function MenuForm({
  mode = "create", 
  initialData = null,
  currentMenuItemId = null,
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState(initialData ?? DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const schema = createMenuSchema({ currentMenuItemId });
    const result = schema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit(result.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-12 lg:gap-16">
      <div className="w-full lg:w-1/3 flex flex-col items-center gap-8 pt-2">
        <div className="flex flex-col items-center">
          <FileInput
            value={formData.imagen}
            onChange={(files) => setFormData((prev) => ({ ...prev, imagen: files }))}
            multiple={false}
            accept="image/*"
          />
          {errors.imagen && <span className="text-error text-caption mt-1">{errors.imagen}</span>}
        </div>

        <div className="flex items-center gap-4 mt-2">
          <span className="font-label text-text-primary text-body">Estado</span>
          <StatusSwitch
            checked={formData.estado}
            onChange={(checked) => setFormData((prev) => ({ ...prev, estado: checked }))}
          />
        </div>
      </div>

      <div className="w-full lg:w-2/3 flex flex-col justify-between">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <Input
            label="Nombre del platillo"
            name="nombre"
            placeholder="Ingrese nombre"
            value={formData.nombre}
            onChange={handleChange}
            error={errors.nombre}
          />

          <Input
            label="Precio"
            name="precio"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ingrese precio"
            value={formData.precio}
            onChange={handleChange}
            error={errors.precio}
          />

          <Select
            label="Categoría"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            options={menuCategories}
            error={errors.categoria}
          />

          <Input
            label="Descripción"
            name="descripcion"
            placeholder="Ingrese descripción"
            value={formData.descripcion}
            onChange={handleChange}
            error={errors.descripcion}
          />
        </div>

        <div className="flex justify-end gap-4 mt-12 pt-6">
          <Button type="button" variant="secondary" onClick={onCancel} className="px-10">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full md:w-auto px-14 font-bold shadow-sm"
          >
            {isSubmitting ? "Guardando..." : mode === "edit" ? "Guardar Cambios" : "Registrar"}
          </Button>
        </div>
      </div>
    </form>
  );
}