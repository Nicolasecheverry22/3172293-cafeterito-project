import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNavigate as useNavParams, useParams as useParamValues } from "react-router-dom";
import Swal from "sweetalert2";
import { FormNavbar, Input, Button, StatusSwitch, Select } from "@/shared";
import { Pencil, Building2 } from "lucide-react";
import { providers } from "../../providers/data/providers";
import { createEditProviderSchema } from "../../providers/schemas/editProviderSchema";

import {
  showSystemErrorAlert,
  showDeleteCancelAlert,
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
  });

  if (!provider) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      Object.assign(provider, { ...result.data });

      await Swal.fire({
        title: "¡Proveedor actualizado!",
        text: "Los cambios fueron guardados correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "rounded-2xl",
          title: "text-green-600 font-heading font-bold",
          confirmButton:
            "bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg cursor-pointer font-medium",
          timerProgressBar: "!bg-green-600",
        },
        buttonsStyling: false,
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
    const result = await Swal.fire({
      title: "¿Descartar cambios?",
      text: "Los cambios realizados no se guardarán.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, descartar",
      cancelButtonText: "Continuar editando",
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
        title: "Edición cancelada",
        text: "No se guardaron los cambios.",
      });
      navigate("/providerList");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background pb-12">
      

      {/* Encabezado */}
      <div className="max-w-7xl w-full mx-auto px-6 mt-8 mb-6 flex items-center gap-3">
        <Pencil className="w-9 h-9 text-text-primary" />
        <h1 className="text-main font-heading font-bold text-text-primary text-2xl">
          Editar Proveedor
        </h1>
      </div>

      {/* Formulario Principal */}
      <form
        onSubmit={handleSave}
        className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start"
      >
        {/* Columna Izquierda: Estado */}
        <div className="bg-surface-muted rounded-3xl p-6 shadow-sm border border-border/50 flex flex-col items-center gap-4 text-center">
          <p className="text-text-primary font-heading font-bold text-lg">
            Estado
          </p>
          <StatusSwitch
            size="lg"
            checked={formData.isActive}
            onChange={(checked) =>
              setFormData((prev) => ({ ...prev, isActive: checked }))
            }
          />
        </div>

        {/* Columna Derecha: Campos de Formulario */}
        <div className="lg:col-span-3 bg-surface-muted rounded-3xl p-8 shadow-sm border border-border/50 flex flex-col gap-8">
          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border/40 grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="md:col-span-2">
              <Input
                label="Nombre del Proveedor"
                name="providerName"
                type="text"
                value={formData.providerName}
                onChange={handleChange}
                error={errors.providerName}
              />
            </div>
            <Input
              label="Dirección"
              name="providerAddress"
              type="text"
              value={formData.providerAddress}
              onChange={handleChange}
              error={errors.providerAddress}
            />
            <Input
              label="Teléfono"
              name="providerPhone"
              type="text"
              value={formData.providerPhone}
              onChange={handleChange}
              error={errors.providerPhone}
            />
            <div className="md:col-span-2">
              <Input
                label="Correo Electrónico"
                name="providerEmail"
                type="email"
                value={formData.providerEmail}
                onChange={handleChange}
                error={errors.providerEmail}
              />
            </div>
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
          <div className="flex gap-4 items-center justify-end border-t border-border/40 pt-6">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={handleCancel}
            >
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