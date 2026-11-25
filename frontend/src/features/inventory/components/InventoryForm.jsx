import { useState } from "react";
import { 
  Input, 
  Select, 
  Button, 
  FileInput,
} from "@/shared";
import { createInventorySchema } from "../schemas/inventorySchema";
import { showCreateErrorAlert } from "@/shared/services/alertService";
import { INVENTORY_STATUSES } from "@/services/inventoryApi";
import { IMAGE_ACCEPT, IMAGE_HINT, validateImageFile } from "@/shared/utils/image";

const DEFAULT_FORM_DATA = {
  provisionName: "",
  category: "",
  unit: "",
  stock: "",
  price: "",
  batch: "",
  barcode: "",
  expirationDate: "",
  minStock: "",
  maxStock: "",
  provisionImage: [],
  isActive: true,
  status: "",
  provisionStatus: "",
};

// Estados del backend (RFADMIN08): Disponible / Vencido / Avería / Agotado
const STATUS_OPTIONS = INVENTORY_STATUSES.map((s) => ({ value: s, label: s }));

const UNIT_OPTIONS = [
  { value: "kg", label: "Kilogramos (kg)" },
  { value: "g", label: "Gramos (g)" },
  { value: "lt", label: "Litros (lt)" },
  { value: "ml", label: "Mililitros (ml)" },
  { value: "unid", label: "Unidades (unid)" },
  { value: "lb", label: "Libras (lb)" },
];

export default function InventoryForm({
  mode = "create",
  currentProvisionId = null,
  categoryTypes = [],
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleStatusChange = (e) => {
    const selectedStatus = e.target.value;

    const isActivo =
      selectedStatus.toLowerCase() === "activo" ||
      selectedStatus.toLowerCase() === "disponible";

    setFormData((prev) => ({
      ...prev,
      status: selectedStatus,
      provisionStatus: selectedStatus,
      isActive: isActivo,
    }));

    if (errors.status) {
      setErrors((prev) => ({ ...prev, status: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ejecutar validación de Zod con las reglas de negocio
    const schema = createInventorySchema({ currentProvisionId });
    const result = schema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);

      await showCreateErrorAlert({
        entity: "suministro",
        text: "Por favor revisa los errores indicados en el formulario antes de guardar.",
      });
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
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
    >
      {/* COLUMNA 1 */}
      <div className="space-y-4">
        <Input
          label="Nombre del suministro"
          name="provisionName"
          type="text"
          value={formData.provisionName}
          placeholder="Ingrese el nombre (Ej. Pollo)"
          onChange={handleChange}
          error={errors.provisionName}
        />

        <Select
          label="Categoría"
          name="category"
          value={formData.category}
          options={categoryTypes}
          onChange={handleChange}
          error={errors.category}
        />

        <Select
          label="Unidad de medida"
          name="unit"
          value={formData.unit}
          options={UNIT_OPTIONS}
          onChange={handleChange}
          error={errors.unit}
        />

        <Select
          label="Estado del suministro"
          name="status"
          value={formData.status}
          onChange={handleStatusChange}
          placeholder="Seleccione estado"
          options={STATUS_OPTIONS}
          error={errors.status}
        />
      </div>

      {/* COLUMNA 2 */}
      <div className="space-y-4">
        <Input
          label="Stock actual"
          name="stock"
          type="number"
          min="0"
          value={formData.stock}
          placeholder="Ingrese el stock (Ej. 28)"
          onChange={handleChange}
          error={errors.stock}
        />

        <Input
          label="Precio unitario ($)"
          name="price"
          type="number"
          min="0"
          value={formData.price}
          placeholder="Ingrese el precio (Ej. 12000)"
          onChange={handleChange}
          error={errors.price}
        />

        <Input
          label="Lote"
          name="batch"
          type="text"
          value={formData.batch}
          placeholder="Ingrese el lote (Ej. LOT-101A)"
          onChange={handleChange}
          error={errors.batch}
        />

        <Input
          label="Código de barras"
          name="barcode"
          type="text"
          value={formData.barcode}
          placeholder="Ingrese el código de barras (Ej. 7701234567890)"
          onChange={handleChange}
          error={errors.barcode}
        />

        <Input
          label="Fecha de vencimiento (opcional)"
          name="expirationDate"
          type="date"
          value={formData.expirationDate}
          onChange={handleChange}
          error={errors.expirationDate}
        />

        <Input
          label="Stock mínimo"
          name="minStock"
          type="number"
          min="0"
          value={formData.minStock}
          placeholder="Ingrese stock mínimo (Ej. 10)"
          onChange={handleChange}
          error={errors.minStock}
        />

        <Input
          label="Stock máximo"
          name="maxStock"
          type="number"
          min="0"
          value={formData.maxStock}
          placeholder="Ingrese stock máximo (Ej. 50)"
          onChange={handleChange}
          error={errors.maxStock}
        />
      </div>

      {/* COLUMNA 3 */}
      <div className="flex flex-col justify-between h-full space-y-6 md:col-span-2 lg:col-span-1">
        <div>
          <span className="font-label text-text-primary text-small block mb-2 text-center">
            Imagen del suministro <span className="text-error">*</span>
          </span>
          <FileInput
            value={formData.provisionImage}
            onChange={(files) => {
              setFormData((prev) => ({ ...prev, provisionImage: files }));
              setErrors((prev) => ({ ...prev, provisionImage: undefined }));
            }}
            multiple={false}
            accept={IMAGE_ACCEPT}
            validateFile={validateImageFile}
            hint={IMAGE_HINT}
            error={errors.provisionImage}
          />
        </div>

        <div className="flex gap-4 items-center justify-end pt-4 max-sm:flex-col-reverse max-sm:items-stretch max-sm:*:w-full">
          <Button variant="cancel" size="sm" type="button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full md:w-auto px-10 font-bold shadow-elevation-1"
          >
            {isSubmitting
              ? "Guardando..."
              : mode === "edit"
              ? "Guardar Cambios"
              : "Crear Suministro"}
          </Button>
        </div>
      </div>
    </form>
  );
}