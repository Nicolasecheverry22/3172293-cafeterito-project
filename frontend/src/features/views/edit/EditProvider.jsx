import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";

import { Input, StatusSwitch, Select, FileInput, Button } from "@/shared";
import { providers } from "../../providers/data/providers";
import { createEditProviderSchema } from "../../providers/schemas/editProviderSchema";

import {
  showSystemErrorAlert,
  showDeleteCancelAlert,
  showSuccessAlert,
  showConfirmDeleteAlert,
  showCreateErrorAlert
} from "@/shared/services/alertService";

const DOCUMENT_TYPES = [
  { value: "NIT", label: "NIT" },
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "CE", label: "Cédula de Extranjería" },
];

export default function EditProvider() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errors, setErrors] = useState({});

  const provider = providers.find((p) => String(p.id) === String(id));

  useEffect(() => {
    if (!provider) {
      showSystemErrorAlert({
        text: "El proveedor que intentas editar no existe.",
      }).then(() => navigate("/providerList", { replace: true }));
    }
  }, [provider, navigate]);

  const [formData, setFormData] = useState({
    providerDocumentType: provider?.providerDocumentType ?? "NIT",
    nit: provider?.nit ?? "",
    providerName: provider?.providerName ?? "",
    providerAddress: provider?.providerAddress ?? "",
    providerPhone: provider?.providerPhone ?? "",
    providerEmail: provider?.providerEmail ?? "",
    productService: provider?.productService ?? "",
    isActive: provider?.isActive ?? true,
    file: provider?.file ?? [],
  });

  if (!provider) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (files) => {
    setFormData((prev) => ({ ...prev, file: files }));
    if (errors.file) {
      setErrors((prev) => ({ ...prev, file: undefined }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const schema = createEditProviderSchema({ currentProviderId: provider.id });
      const result = schema.safeParse(formData);

      if (!result.success) {
        console.error("Errores específicos de validación (Zod):", result.error.format());

        const fieldErrors = {};
        result.error.issues.forEach((issue) => {
          fieldErrors[issue.path[0]] = issue.message;
        });
        setErrors(fieldErrors);

        await showCreateErrorAlert({
          entity: "producto",
          text: "Por favor revisa los errores indicados en el formulario antes de guardar.",
        });
      return;
      }

      setErrors({});

      // Actualización directa del objeto de proveedor en el mock data
      Object.assign(provider, {
        ...result.data,
        id: provider.id,
      });

      await showSuccessAlert({
        title: "¡Proveedor actualizado!",
        text: "Los cambios fueron guardados correctamente.",
      });

      navigate("/providerList");
    } catch (error) {
      console.error("Error al actualizar proveedor:", error);
      await showSystemErrorAlert({
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

    if (result.isConfirmed) {
      showDeleteCancelAlert({
        title: "Edición cancelada",
        text: "No se guardaron los cambios.",
      });
      navigate("/providerList");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-[#a1a1a1]/80 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Pencil className="w-8 h-8 text-black" />
        <h1 className="text-3xl font-heading font-black text-black">
          Editar Proveedor
        </h1>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Bloque Izquierdo: Estado */}
        <div className="lg:col-span-3 bg-[#d4d4d4] rounded-3xl p-6 flex flex-col items-center justify-center gap-4 text-center shadow-md">
          <span className="text-black font-heading font-bold text-lg">
            Estado
          </span>
          <StatusSwitch
            size="lg"
            checked={formData.isActive}
            onChange={(checked) =>
              setFormData((prev) => ({ ...prev, isActive: checked }))
            }
          />
        </div>

        {/* Bloque Derecho: FileInput + Inputs del Formulario */}
        <div className="lg:col-span-9 bg-[#d4d4d4] rounded-3xl p-8 flex flex-col items-center gap-6 shadow-md">
          {/* Subir imagen / FileInput centrado */}
          <div className="w-full flex justify-center">
            <FileInput
              value={formData.file}
              onChange={handleFileChange}
              accept="image/*,.pdf"
            />
            {errors.file && (
              <span className="text-red-600 text-xs mt-1 block">{errors.file}</span>
            )}
          </div>

          {/* Sub-tarjeta contenedora de los campos de texto */}
          <div className="w-full bg-[#a1a1a1]/70 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tipo de Documento"
              name="providerDocumentType"
              value={formData.providerDocumentType}
              onChange={handleChange}
              options={DOCUMENT_TYPES}
              error={errors.providerDocumentType}
            />
            <Input
              label="NIT / Número de Documento"
              name="nit"
              type="text"
              value={formData.nit}
              onChange={handleChange}
              error={errors.nit}
            />
            <Input
              label="Nombre del Proveedor"
              name="providerName"
              type="text"
              value={formData.providerName}
              onChange={handleChange}
              error={errors.providerName}
            />
            <Input
              label="Teléfono"
              name="providerPhone"
              type="text"
              value={formData.providerPhone}
              onChange={handleChange}
              error={errors.providerPhone}
            />
            <Input
              label="Dirección"
              name="providerAddress"
              type="text"
              value={formData.providerAddress}
              onChange={handleChange}
              error={errors.providerAddress}
            />
            <Input
              label="Correo Electrónico"
              name="providerEmail"
              type="email"
              value={formData.providerEmail}
              onChange={handleChange}
              error={errors.providerEmail}
            />
            <div className="md:col-span-2">
              <Input
                label="Productos Suministrados"
                name="productService"
                type="text"
                value={formData.productService}
                onChange={handleChange}
                error={errors.productService}
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="w-full flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" size="md" type="button" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" type="submit">
              Guardar Cambios
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}