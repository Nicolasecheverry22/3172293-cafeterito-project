import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";

import { Input, StatusSwitch, FileInput, Button } from "@/shared";
import { getProviderById, updateProvider } from "@/services/providerApi";
import { createEditProviderSchema } from "../../providers/schemas/editProviderSchema";
import { buildImagePayload, IMAGE_ACCEPT, IMAGE_HINT, validateImageFile } from "@/shared/utils/image";

import {
  showSystemErrorAlert,
  showSuccessAlert,
  showCreateErrorAlert
} from "@/shared/services/alertService";
import { confirmDiscardChanges, isFormDirty } from "@/shared/services/confirmAction";

export default function EditProvider() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errors, setErrors] = useState({});

  const [provider, setProvider] = useState(null);
  const [formData, setFormData] = useState(null);
  // Estado inicial del formulario (primer valor cargado) para saber si hay cambios
  const [initialForm, setInitialForm] = useState(null);
  if (formData && !initialForm) setInitialForm(formData);
  const [imageRemoved, setImageRemoved] = useState(false);

  // Carga el proveedor real desde la BD
  useEffect(() => {
    getProviderById(id)
      .then((data) => {
        setProvider(data);
        setFormData({
          nit: data.nit ?? "",
          providerName: data.providerName ?? "",
          providerAddress: data.providerAddress ?? "",
          providerPhone: data.providerPhone ?? "",
          providerEmail: data.providerEmail ?? "",
          productService: data.productService ?? "",
          isActive: Boolean(data.is_active),
          file: [],
        });
      })
      .catch(() =>
        showSystemErrorAlert({ text: "El proveedor que intentas editar no existe." })
          .then(() => navigate("/providerList", { replace: true }))
      );
  }, [id, navigate]);

  if (!formData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p className="text-text-secondary">Cargando...</p>
      </div>
    );
  }

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
      const schema = createEditProviderSchema();
      const result = schema.safeParse(formData);

      if (!result.success) {
        console.error("Errores específicos de validación (Zod):", result.error.format());

        const fieldErrors = {};
        result.error.issues.forEach((issue) => {
          fieldErrors[issue.path[0]] = issue.message;
        });
        setErrors(fieldErrors);

        await showCreateErrorAlert({
          entity: "proveedor",
          text: "Por favor revisa los errores indicados en el formulario antes de guardar.",
        });
      return;
      }

      setErrors({});

      // Logo nuevo → comprimido + miniatura; quitado → removeImage; sin cambios → se conserva
      const imageFields = await buildImagePayload("providerImage", formData.file, {
        removed: imageRemoved,
      });

      // PUT /api/providers/:id
      await updateProvider(provider.id, {
        ...imageFields,
        // El formulario de edición no cambia el tipo de documento: se conserva el guardado
        documentType: provider.documentType ?? "NIT",
        nit: result.data.nit,
        providerName: result.data.providerName,
        providerEmail: result.data.providerEmail,
        providerPhone: result.data.providerPhone,
        providerAddress: result.data.providerAddress,
        productService: result.data.productService,
        isActive: formData.isActive,
      });

      await showSuccessAlert({
        title: "¡Proveedor actualizado!",
        text: "Los cambios fueron guardados correctamente.",
      });

      navigate("/providerList");
    } catch (error) {
      console.error("Error al actualizar proveedor:", error);
      await showSystemErrorAlert({
        text: error.message || "Los cambios no pudieron guardarse.",
      });
    }
  };

  const handleCancel = async () => {
    const canLeave = await confirmDiscardChanges({
      isDirty: isFormDirty(formData, initialForm) || imageRemoved,
      title: "¿Descartar los cambios?",
      text: "Los cambios que hiciste en el proveedor no se guardarán.",
    });
    if (canLeave) navigate("/providerList");
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-surface/80 backdrop-blur-md rounded-shape-xl p-4 sm:p-6 md:p-8 border border-border/40 dark:bg-surface/90 shadow-elevation-3">
      <div className="flex items-center gap-3 mb-6">
        <Pencil className="w-8 h-8 text-text-primary" />
        <h1 className="text-3xl font-heading font-black text-text-primary">
          Editar Proveedor
        </h1>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Bloque Izquierdo: Estado */}
        <div className="lg:col-span-3 bg-surface-muted rounded-shape-xl p-4 sm:p-6 flex flex-col items-center justify-center gap-4 text-center shadow-elevation-2">
          <span className="text-text-primary font-heading font-bold text-lg">
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
        <div className="lg:col-span-9 bg-surface-muted rounded-shape-xl p-4 sm:p-6 md:p-8 flex flex-col items-center gap-6 shadow-elevation-2">
          {/* Subir imagen / FileInput centrado */}
          <div className="w-full flex flex-col items-center">
            <span className="font-label text-text-primary text-small block mb-2">
              Logo del proveedor (opcional)
            </span>
            <FileInput
              value={formData.file}
              onChange={handleFileChange}
              existingUrl={imageRemoved ? null : provider.providerImage}
              onRemoveExisting={() => setImageRemoved(true)}
              multiple={false}
              accept={IMAGE_ACCEPT}
              validateFile={validateImageFile}
              hint={IMAGE_HINT}
              label="Subir logo"
              error={errors.file}
            />
          </div>

          {/* Sub-tarjeta contenedora de los campos de texto */}
          <div className="w-full bg-surface/70 rounded-shape-lg p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="NIT"
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
          <div className="w-full flex items-center justify-end gap-3 pt-2 max-sm:flex-col-reverse max-sm:items-stretch max-sm:*:w-full">
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