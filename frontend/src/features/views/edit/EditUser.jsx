import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input, Button, StatusSwitch, Select, FileInput, Checkbox } from "@/shared";
import { Pencil } from "lucide-react";
import { getDocumentTypes } from "@/services/selectService";
import { getUserById, updateUser } from "@/services/userApi";
import { getGroups } from "@/services/groupApi";
import { createEditUserSchema } from "../../users/schemas/editUserSchema";
import {
  showSystemErrorAlert,
  showDeleteCancelAlert,
  showConfirmDeleteAlert,
  showSuccessAlert,
  showCreateErrorAlert
} from "@/shared/services/alertService";

// Convierte la respuesta del backend al estado del formulario
const toFormData = (user) => ({
  userImage: [],
  userDocumentTypes: user.userDocumentTypes ?? "",
  userDocumentNumber: user.userDocument ?? "",
  userName: user.userName ?? "",
  userPhone: user.userPhone ?? "",
  userEmail: user.userEmail ?? "",
  groupNames: user.groups ?? [],
  isActive: Boolean(user.is_active),
});

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [documentTypes, setDocumentTypes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getDocumentTypes().then(setDocumentTypes);
    getGroups()
      .then((data) => setGroups(data.filter((g) => g.is_active)))
      .catch(() => setGroups([]));
  }, []);

  // Carga el usuario real desde la BD
  useEffect(() => {
    getUserById(id)
      .then((user) => setFormData(toFormData(user)))
      .catch(() =>
        showSystemErrorAlert({ text: "El usuario que intentas editar no existe." })
          .then(() => navigate("/userList", { replace: true }))
      );
  }, [id, navigate]);

  if (!formData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p className="text-text-secondary">Cargando usuario...</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const toggleGroup = (groupName, checked) => {
    setFormData((prev) => ({
      ...prev,
      groupNames: checked
        ? [...prev.groupNames, groupName]
        : prev.groupNames.filter((name) => name !== groupName),
    }));
    if (errors.groupNames) setErrors((prev) => ({ ...prev, groupNames: undefined }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const result = createEditUserSchema().safeParse(formData);

    if (!result.success) {
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
    setIsSaving(true);

    try {
      // PUT /api/users/:id -> actualiza datos y roles (grupos) en la BD
      await updateUser(id, result.data);

      await showSuccessAlert({
        title: "¡Usuario actualizado!",
        text: "Los cambios fueron guardados correctamente.",
      });

      navigate("/userList");
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      await showSystemErrorAlert({
        text: error.message || "Los cambios no pudieron guardarse.",
      });
    } finally {
      setIsSaving(false);
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

        <div className="flex flex-col gap-6">
          <div className="bg-surface-muted rounded-3xl p-6 shadow-sm border border-border/50 flex flex-col items-center gap-4 text-center">
            <p className="text-text-primary font-heading font-bold text-lg">Estado</p>
            <StatusSwitch
              size="lg"
              checked={formData.isActive}
              onChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
            />
          </div>

          {/* Roles = grupos de la BD (mismo criterio que en el registro) */}
          <div className="bg-surface-inverse/70 p-6 rounded-2xl text-text-inverse space-y-3 shadow-inner">
            <h3 className="font-heading text-subtitle mb-2">Tipo de Usuario:</h3>
            {groups.map((group) => (
              <Checkbox
                key={group.group_id}
                id={`group-${group.group_id}`}
                name={`group-${group.group_id}`}
                label={group.group_name}
                checked={formData.groupNames.includes(group.group_name)}
                onChange={(e) => toggleGroup(group.group_name, e.target.checked)}
              />
            ))}
            {errors.groupNames && (
              <span className="text-error text-caption block">{errors.groupNames}</span>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 bg-surface-muted rounded-3xl p-8 shadow-sm border border-border/50 flex flex-col gap-8">

          <div className="w-full flex flex-col items-center">
            <FileInput
              value={formData.userImage}
              onChange={(files) => setFormData((prev) => ({ ...prev, userImage: files }))}
              multiple={true}
            />
          </div>

          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border/40 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Tipo de Documento"
              name="userDocumentTypes"
              value={formData.userDocumentTypes}
              onChange={handleChange}
              options={documentTypes}
              error={errors.userDocumentTypes}
            />
            <Input
              label="Número de documento"
              name="userDocumentNumber"
              type="text"
              value={formData.userDocumentNumber}
              onChange={handleChange}
              error={errors.userDocumentNumber}
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
              label="Teléfono"
              name="userPhone"
              type="text"
              value={formData.userPhone}
              onChange={handleChange}
              error={errors.userPhone}
            />
            <div className="md:col-span-2">
              <Input
                label="Correo Electrónico"
                name="userEmail"
                type="email"
                value={formData.userEmail}
                onChange={handleChange}
                error={errors.userEmail}
              />
            </div>
          </div>

          <div className="flex gap-4 items-center justify-end border-t border-border/40 pt-6">
            <Button variant="secondary" size="md" type="button" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>

        </div>
      </form>
    </div>
  );
}
