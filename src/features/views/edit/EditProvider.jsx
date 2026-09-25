import { FormNavbar, Input, Button, StatusSwitch, FileInput, Select, Checkbox } from "@/shared";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDocumentTypes } from "@/services/selectService";
import { Pencil } from "lucide-react";
import { providers } from "../../providers/data/providers";
import { createEditProviderSchema } from "../../providers/schemas/editProviderSchema";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmDeleteAlert,
} from "../../../shared/services/alertService";

const PRODUCT_CHECKBOXES = [
  { name: "productFood", label: "Alimentos y/o Bebidas" },
  { name: "productSupplies", label: "Insumos" },
  { name: "productFruits", label: "Frutas y/o Verduras" },
  { name: "productOthers", label: "Otro" },
];

export default function EditProvider() {
  const navigate = useNavigate();
  const { id } = useParams();

  const provider = providers.find((p) => p.id === Number(id));
  const [documentTypes, setDocumentTypes] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getDocumentTypes().then(setDocumentTypes);
  }, []);

  useEffect(() => {
    if (!provider) {
      showErrorAlert({
        title: "Proveedor no encontrado",
        text: "El proveedor que intentas editar no existe.",
      }).then(() => navigate("/providerList", { replace: true }));
    }
  }, [provider, navigate]);

  const [formData, setFormData] = useState({
    productImage: provider?.images ?? [],
    providerDocumentType: provider?.providerDocumentType ?? "",
    providerName: provider?.providerName ?? "",
    providerAddress: provider?.providerAddress ?? "",
    providerPhone: provider?.providerPhone ?? "",
    providerEmail: provider?.providerEmail ?? "",
    isActive: provider?.isActive ?? true,
    productFood: provider?.productFood ?? false,
    productSupplies: provider?.productSupplies ?? false,
    productFruits: provider?.productFruits ?? false,
    productOthers: provider?.productOthers ?? false,
  });

  if (!provider) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const schema = createEditProviderSchema({ currentProviderId: provider.id });
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

    try {
      Object.assign(provider, result.data); // TODO: reemplazar por llamada real (ej. providerService.update(provider.id, result.data))
      console.log("Proveedor actualizado:", provider);

      await showSuccessAlert({
        title: "Proveedor actualizado",
        text: "Los cambios fueron guardados correctamente.",
        timer: 2000,
      });

      navigate(-1);
    } catch (error) {
      console.error("Error al actualizar el proveedor:", error);
      await showErrorAlert({
        title: "Error al actualizar el proveedor",
        text: "Los cambios no pudieron guardarse.",
      });
    }
  };

  const handleCancel = async () => {
    const result = await showConfirmDeleteAlert({
      title: "¿Descartar cambios?",
      text: "Los cambios realizados no se guardarán.",
      confirmButtonText: "Sí, descartar",
      cancelButtonText: "Continuar editando",
    });

    if (result.isConfirmed) navigate(-1);
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      <FormNavbar />

      <div className="flex items-center gap-3 mt-10 ml-12">
        <Pencil className="w-10 h-10 text-text-primary" />
        <h1 className="text-main font-heading font-bold text-text-primary">Editar Proveedor</h1>
      </div>

      <form onSubmit={handleSave}>
        <div className="flex flex-row">
          <div className="bg-surface-muted rounded-3xl p-8 shadow-sm mt-20 mx-auto w-fit h-fit mb-20">
            <FileInput
              value={formData.productImage}
              onChange={(files) => setFormData((prev) => ({ ...prev, productImage: files }))}
              multiple={true}
            />
            {errors.productImage && (
              <span className="text-error text-caption mt-1">{errors.productImage}</span>
            )}

            <div className="flex items-center gap-6 mt-6 ml-6">
              <span className="text-text-primary font-heading text-main">Estado</span>
              <StatusSwitch
                size="lg"
                checked={formData.isActive}
                onChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          <div className="flex flex-row items-end justify-start gap-16 bg-surface-muted rounded-3xl p-8 shadow-sm mt-20 mx-auto w-fit h-fit mb-16">
            <div className="w-fit flex flex-col gap-8">
              <h2>Tipo de Documento</h2>
              <h2>Nombre Proveedor</h2>
              <h2>Dirección</h2>
              <h2>Teléfono</h2>
              <h2>Correo</h2>
            </div>

            <div className="w-80 flex flex-col gap-4">
              <Select
                label=""
                name="providerDocumentType"
                value={formData.providerDocumentType}
                onChange={handleChange}
                placeholder="Seleccione una opción"
                options={documentTypes}
                error={errors.providerDocumentType}
              />
              <Input
                label=""
                name="providerName"
                type="text"
                value={formData.providerName}
                onChange={handleChange}
                error={errors.providerName}
              />
              <Input
                label=""
                name="providerAddress"
                type="text"
                value={formData.providerAddress}
                onChange={handleChange}
                error={errors.providerAddress}
              />
              <Input
                label=""
                name="providerPhone"
                type="text"
                value={formData.providerPhone}
                onChange={handleChange}
                error={errors.providerPhone}
              />
              <Input
                label=""
                name="providerEmail"
                type="text"
                value={formData.providerEmail}
                onChange={handleChange}
                error={errors.providerEmail}
              />
            </div>
          </div>
        </div>

        <div className="bg-surface-muted rounded-3xl p-8 shadow-sm mt-10 mb-10 w-fit mx-auto">
          <div className="w-fit flex items-center flex-col gap-4">
            <h1 className="text-text-primary font-heading font-bold text-main">Productos que Suministra</h1>

            <div className="flex flex-col gap-2 items-start">
              {PRODUCT_CHECKBOXES.map(({ name, label }) => (
                <Checkbox key={name} name={name} label={label} checked={formData[name]} onChange={handleChange} />
              ))}
            </div>
            {errors.productFood && (
              <span className="text-error text-caption">{errors.productFood}</span>
            )}
          </div>
        </div>

        <div className="flex gap-6 items-center justify-end mt-4 mr-20 mb-10">
          <Button variant="secondary" size="md" type="button" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button variant="primary" size="md" type="submit">
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
}