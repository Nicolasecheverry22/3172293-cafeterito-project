import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { FormNavbar, Input, Button, StatusSwitch, Select, FileInput } from "@/shared";
import { Pencil } from "lucide-react";
import { getDocumentTypes, getRoles } from "@/services/selectService";
import { users } from "../../users/data/users";
import { createEditUserSchema } from "../../users/schemas/editUserSchema";
import {
  showSystemErrorAlert,
  showDeleteCancelAlert,
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
    userDocumentTypes: user?.userDocumentTypes ?? "",
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
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const schema = createEditUserSchema({ currentUserId: user.id });
    const result = schema.safeParse(formData);

    if (!result.success) {
  
    console.log("Campos con error:", result.error.flatten().fieldErrors);
    
    const fieldErrors = {};
    result.error.issues.forEach((issue) => {
      fieldErrors[issue.path[0]] = issue.message;
    });
    setErrors(fieldErrors);
    return;
    }

    setErrors({});

    try {
      // Actualizamos los datos del objeto usuario
      Object.assign(user, result.data);

      await Swal.fire({
        title: "¡Usuario actualizado!",
        text: "Los cambios fueron guardados correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "rounded-2xl",
          title: "text-green-600 font-heading font-bold",
          confirmButton: "bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg cursor-pointer font-medium",
          timerProgressBar: "!bg-green-600",
        },
        buttonsStyling: false,
      });

      // Redirección explícita a la lista de usuarios
      navigate("/userList");
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
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
      navigate("/userList");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background pb-12">

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
              onChange={(files) => setFormData((prev) => ({ ...prev, userImage: files }))}
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