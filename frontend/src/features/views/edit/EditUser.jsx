import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input, Button, StatusSwitch, Select, FileInput } from "@/shared";
import { Pencil } from "lucide-react";
import { getDocumentTypes, getRoles } from "@/services/selectService";
import { users } from "../../users/data/users";
import { createEditUserSchema } from "../../users/schemas/editUserSchema";
import {
  showSystemErrorAlert,
  showDeleteCancelAlert,
  showConfirmDeleteAlert,
  showSuccessAlert,
  showCreateErrorAlert
} from "@/shared/services/alertService";

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [documentTypes, setDocumentTypes] = useState([]);
  const [rolesOptions, setRolesOptions] = useState([]);
  const [errors, setErrors] = useState({});

  const user = users.find((u) => u.id === Number(id));

  useEffect(() => {
    getDocumentTypes().then(setDocumentTypes);
    getRoles().then(setRolesOptions);
  }, []);

  useEffect(() => {
    if (!user) {
      showSystemErrorAlert({
        text: "El usuario que intentas editar no existe.",
      }).then(() => navigate("/userList", { replace: true }));
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    userImage: user?.userImage ?? [],
    userDocumentTypes: user?.userDocumentTypes ?? "CC",
    userName: user?.userName ?? "",
    userAddress: user?.userAddress ?? "",
    userPhone: user?.userPhone ?? "",
    userEmail: user?.userEmail ?? "",
    userRole: user?.userRole ?? user?.role ?? "",
    isActive: user?.isActive ?? user?.is_active ?? true,
  });

  if (!user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpia el error del campo cuando el usuario empieza a escribir nuevamente
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const schema = createEditUserSchema({ currentUserId: user.id });
    const result = schema.safeParse(formData);

    // Si falla la validación con Zod
    if (!result.success) {
      console.log("Campos con error:", result.error.flatten().fieldErrors);

      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);

      await showCreateErrorAlert({
        title: "Campos inválidos",
        text: "Por favor revisa los campos señalados en el formulario antes de guardar.",
      });

      return;
    }

    setErrors({});

    try {
      // Actualizamos los datos del usuario sincronizando todas las variantes de estado
      Object.assign(user, {
        ...result.data,
        isActive: formData.isActive,
        is_active: formData.isActive,
        status: formData.isActive ? "Activo" : "Inactivo",
      });

      await showSuccessAlert({
        title: "¡Usuario actualizado!",
        text: "Los cambios fueron guardados correctamente.",
      });

      navigate("/userList");
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
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
      navigate("/userList");
    }
  };

  return (
    <div className="bg-surface/70 backdrop-blur-md rounded-3xl p-6 md:p-2 border border-border/40 shadow-2xl">

      <div className="max-w-7xl w-full mx-auto px-6 mt-8 mb-6 flex items-center gap-3">
        <Pencil className="w-9 h-9 text-text-primary" />
        <h1 className="text-main font-heading font-bold text-text-primary text-2xl">
          Editar Usuario
        </h1>
      </div>

      <form onSubmit={handleSave} className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        <div className="bg-surface-muted rounded-3xl p-6 shadow-sm border border-border/50 flex flex-col items-center gap-4 text-center">
          <p className="text-text-primary font-heading font-bold text-lg">Estado</p>
          <StatusSwitch
            size="lg"
            checked={formData.isActive}
            onChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
          />
        </div>

        <div className="lg:col-span-3 bg-surface-muted rounded-3xl p-8 shadow-sm border border-border/50 flex flex-col gap-8">
          
          <div className="w-full flex flex-col items-center">
            <FileInput
              value={formData.userImage}
              onChange={(files) => {
                setFormData((prev) => ({ ...prev, userImage: files }));
                if (errors.userImage) {
                  setErrors((prev) => ({ ...prev, userImage: undefined }));
                }
              }}
              multiple={true}
            />
            {errors.userImage && (
              <span className="text-error text-caption mt-2 font-medium">{errors.userImage}</span>
            )}
          </div>

          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border/40 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Tipo de Documento"
              name="userDocumentTypes"
              value={formData.userDocumentTypes}
              onChange={handleChange}
              placeholder="Seleccione una opción"
              options={documentTypes}
              error={errors.userDocumentTypes}
            />
            <Input
              label="Nombre Completo"
              name="userName"
              type="text"
              value={formData.userName}
              onChange={handleChange}
              error={errors.userName}
            />
            <Input
              label="Dirección"
              name="userAddress"
              type="text"
              value={formData.userAddress}
              onChange={handleChange}
              error={errors.userAddress}
            />
            <Input
              label="Teléfono"
              name="userPhone"
              type="text"
              value={formData.userPhone}
              onChange={handleChange}
              error={errors.userPhone}
            />
            <Select
              label="Rol"
              name="userRole"
              value={formData.userRole}
              onChange={handleChange}
              placeholder="Seleccione un rol"
              options={rolesOptions}
              error={errors.userRole}
            />
            <Input
              label="Correo Electrónico"
              name="userEmail"
              type="email"
              value={formData.userEmail}
              onChange={handleChange}
              error={errors.userEmail}
            />
          </div>

          <div className="flex gap-4 items-center justify-end border-t border-border/40 pt-6">
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