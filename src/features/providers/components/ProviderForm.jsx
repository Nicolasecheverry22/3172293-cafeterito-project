import { useState } from "react";
import { Plus } from "lucide-react";
import { Input, Select, Checkbox, Button, FileInput, StatusSwitch } from "@/shared";
import { createProviderSchema } from "../schemas/providerSchema";

const PRODUCT_CHECKBOXES = [
  { name: "productFood", label: "Alimentos y/o Bebidas" },
  { name: "productSupplies", label: "Insumos" },
  { name: "productFruits", label: "Frutas y/o Verduras" },
  { name: "productOthers", label: "Otro:" },
];

const DEFAULT_FORM_DATA = {
  providerDocumentType: "",
  providerDocumentNumber: "",
  providerName: "",
  isActive: true,
  providerEmail: "",
  providerEmailConfirm: "",
  providerAddress: "",
  providerPhone: "",
  productFood: false,
  productSupplies: false,
  productFruits: false,
  productOthers: false,
  images: [],
};

export default function ProviderForm({
  mode = "create", 
  initialData = null,
  currentProviderId = null,
  documentTypes = [],
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

    const schema = createProviderSchema({ currentProviderId });
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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="space-y-4">
        <Select
          label="Tipo de documento"
          name="providerDocumentType"
          value={formData.providerDocumentType}
          options={documentTypes}
          onChange={handleChange}
          error={errors.providerDocumentType}
        />

        <Input
          label="Número de documento"
          name="providerDocumentNumber"
          type="text"
          value={formData.providerDocumentNumber}
          placeholder="Ingrese su documento"
          onChange={handleChange}
          error={errors.providerDocumentNumber}
        />

        <Input
          label="Nombre completo"
          name="providerName"
          type="text"
          value={formData.providerName}
          placeholder="Ingrese nombre del proveedor"
          onChange={handleChange}
          error={errors.providerName}
        />

        <div className="flex items-center gap-4 py-2">
          <span className="font-label text-text-primary text-small">Estado</span>
          <StatusSwitch
            checked={formData.isActive}
            onChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
          />
        </div>

        <Input
          label="Correo electrónico"
          name="providerEmail"
          type="email"
          value={formData.providerEmail}
          placeholder="Ingrese correo"
          onChange={handleChange}
          error={errors.providerEmail}
        />

        <Input
          label="Confirmar correo electrónico"
          name="providerEmailConfirm"
          type="email"
          value={formData.providerEmailConfirm}
          placeholder="Confirme correo"
          onChange={handleChange}
          error={errors.providerEmailConfirm}
        />
      </div>

      <div className="flex flex-col justify-between space-y-4">
        <div>
          <FileInput
            value={formData.images}
            onChange={(files) => setFormData((prev) => ({ ...prev, images: files }))}
            multiple={false}
          />
        </div>

        <div className="space-y-4">
          <Input
            label="Dirección"
            name="providerAddress"
            type="text"
            value={formData.providerAddress}
            placeholder="Ingrese dirección"
            onChange={handleChange}
            error={errors.providerAddress}
          />

          <Input
            label="Número telefónico"
            name="providerPhone"
            type="tel"
            value={formData.providerPhone}
            placeholder="Ingrese número"
            onChange={handleChange}
            error={errors.providerPhone}
          />
        </div>
      </div>

      <div className="flex flex-col justify-between h-full">
        <div className="bg-surface-inverse/70 p-6 rounded-2xl text-text-inverse space-y-3 shadow-inner">
          <h3 className="font-heading text-subtitle mb-2">Producto que suministra:</h3>

          {PRODUCT_CHECKBOXES.map(({ name, label }) => (
            <Checkbox key={name} name={name} label={label} checked={formData[name]} onChange={handleChange} />
          ))}

          {errors.productFood && (
            <span className="text-error text-caption block">{errors.productFood}</span>
          )}
        </div>

        <div className="flex gap-4 items-center justify-end mt-4">
          <Button variant="secondary" size="sm" type="button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : mode === "edit" ? "Guardar Cambios" : "Crear Proveedor"}
          </Button>
        </div>
      </div>
    </form>
  );
}