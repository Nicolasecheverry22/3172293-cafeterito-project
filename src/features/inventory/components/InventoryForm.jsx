import { useState } from "react";
import { Input, Button, Select, FileInput } from "@/shared";
import { createInventorySchema } from "../schemas/inventorySchema";

const DEFAULT_FORM_DATA = {
  productId: "",
  productImage: [],
  productName: "",
  productDescription: "",
  productCategory: "",
  productCode: "",
  foodPrice: "",
  foodBrand: "",
  foodQuantity: "",
};

export default function InventoryForm({
  mode = "create", 
  initialData = null,
  currentProductId = null,
  categoryTypes = [],
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState(initialData ?? DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const schema = createInventorySchema({ currentProductId });
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="flex flex-col items-center">
          <FileInput
            value={formData.productImage}
            onChange={(files) => setFormData((prev) => ({ ...prev, productImage: files }))}
            multiple={true}
            accept="image/png"
          />
          {errors.productImage && (
            <span className="text-error text-caption mt-1">{errors.productImage}</span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="ID del Producto"
            name="productId"
            type="text"
            value={formData.productId}
            onChange={handleChange}
            placeholder="Ej: PROD-001"
            error={errors.productId}
            disabled={mode === "edit"}
          />

          <Input
            label="Nombre del Producto"
            name="productName"
            type="text"
            value={formData.productName}
            onChange={handleChange}
            placeholder="Escribe el nombre del producto"
            error={errors.productName}
          />

          <Input
            label="Descripción"
            name="productDescription"
            type="text"
            value={formData.productDescription}
            onChange={handleChange}
            placeholder="Escribe la descripción del producto"
            error={errors.productDescription}
          />

          <Select
            label="Categoría de alimentos"
            name="productCategory"
            value={formData.productCategory}
            onChange={handleChange}
            placeholder="Seleccione una Categoría"
            options={categoryTypes}
            error={errors.productCategory}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Código de Barras"
            name="productCode"
            type="text"
            value={formData.productCode}
            onChange={handleChange}
            placeholder="Escribe el código de barras"
            error={errors.productCode}
          />

          <Input
            label="Precio"
            name="foodPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.foodPrice}
            onChange={handleChange}
            placeholder="Ingrese precio del producto"
            error={errors.foodPrice}
          />

          <Input
            label="Marca"
            name="foodBrand"
            type="text"
            value={formData.foodBrand}
            onChange={handleChange}
            placeholder="Ej: Alpina"
            error={errors.foodBrand}
          />

          <Input
            label="Cantidad"
            name="foodQuantity"
            type="number"
            min="0"
            step="1"
            value={formData.foodQuantity}
            onChange={handleChange}
            placeholder="Ej: 10"
            error={errors.foodQuantity}
          />
        </div>
      </div>

      <div className="flex gap-4 items-center justify-end mt-4">
        <Button variant="secondary" size="sm" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" size="md" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : mode === "edit" ? "Guardar Cambios" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}