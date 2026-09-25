import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormNavbar, Input, Button, StatusSwitch, Select, FileInput } from "@/shared";
import { Pencil } from "lucide-react";
import { getDocumentTypes } from "@/services/selectService";
import { users } from "../../users/data/users";
import { createEditUserSchema } from "../../users/schemas/editUserSchema";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmDeleteAlert,
} from "../../../shared/services/alertService";

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [documentTypes, setDocumentTypes] = useState([]);
  const [errors, setErrors] = useState({});

  const user = users.find((u) => u.id === Number(id));

  useEffect(() => {
    getDocumentTypes().then(setDocumentTypes);
  }, []);

  useEffect(() => {
    if (!user) {
      showErrorAlert({
        title: "Usuario no encontrado",
        text: "El usuario que intentas editar no existe.",
      }).then(() => navigate("/userList", { replace: true }));
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    userImage: user?.userImage ?? [],
    userDocumentTypes: user?.userDocumentTypes ?? "",
    userName: user?.userName ?? "",
    address: user?.address ?? "",
    userPhone: user?.userPhone ?? "",
    userEmail: user?.userEmail ?? "",
    isActive: user?.isActive ?? true,
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
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    try {
      Object.assign(user, result.data);  
      console.log("Usuario actualizado:", user);

      await showSuccessAlert({
        title: "Usuario actualizado",
        text: "Los cambios fueron guardados correctamente.",
        timer: 2000,
      });

      navigate(-1);
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      await showErrorAlert({
        title: "Error al actualizar el usuario",
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
        <h1 className="text-main font-heading font-bold text-text-primary">Editar Usuario</h1>
      </div>

      <form onSubmit={handleSave} className="flex flex-row">
        <div className="bg-surface-muted rounded-3xl p-8 shadow-sm mt-20 mx-auto w-fit h-fit mr-20 ml-20">
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-4 w-fit">
              <p className="text-text-primary font-heading text-main">Estado</p>
              <StatusSwitch
                size="lg"
                checked={formData.isActive}
                onChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-20 bg-surface-muted rounded-3xl p-8 shadow-sm mt-20 mx-auto w-fit h-fit mb-20">
          <div className="flex items-center flex-col gap-8 flex-1">
            <FileInput
              value={formData.userImage}
              onChange={(files) => setFormData((prev) => ({ ...prev, userImage: files }))}
              multiple={true}
            />
            {errors.userImage && (
              <span className="text-error text-caption mt-1">{errors.userImage}</span>
            )}

            <div className="flex flex-row items-end justify-start gap-16 bg-surface rounded-3xl p-8 shadow-sm mt-8 mx-auto w-fit">
              <div className="w-fit flex flex-col gap-8">
                <h2>Tipo de Documento</h2>
                <h2>Nombre Completo</h2>
                <h2>Dirección</h2>
                <h2>Teléfono</h2>
                <h2>Correo</h2>
              </div>

              <div className="w-80 flex flex-col gap-4">
                <Select
                  label=""
                  name="userDocumentTypes"
                  value={formData.userDocumentTypes}
                  onChange={handleChange}
                  placeholder="Seleccione una opción"
                  options={documentTypes}
                  error={errors.userDocumentTypes}
                />
                <Input
                  label=""
                  name="userName"
                  type="text"
                  value={formData.userName}
                  onChange={handleChange}
                  error={errors.userName}
                />
                <Input
                  label=""
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                />
                <Input
                  label=""
                  name="userPhone"
                  type="text"
                  value={formData.userPhone}
                  onChange={handleChange}
                  error={errors.userPhone}
                />
                <Input
                  label=""
                  name="userEmail"
                  type="text"
                  value={formData.userEmail}
                  onChange={handleChange}
                  error={errors.userEmail}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-8 items-center justify-end mt-4 mr-10">
            <Button variant="secondary" size="md" type="button" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" type="submit">
              Guardar
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}