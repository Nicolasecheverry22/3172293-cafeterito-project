import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Plus } from "lucide-react";

import { Input, Select, Checkbox, Button, FileInput, StatusSwitch } from "@/shared";

import { getDocumentTypes } from "@/services/selectService";
import { users as usersData } from "../data/users";
import { userSchema } from "../schemas/userSchema";

export default function CreateUserPage() {
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [documentTypes, setDocumentTypes] = useState([]);

  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    confirmEmail: "",
    userPhone: "",
    address: "",
    userDocumentTypes: "",
    userDocumentNumber: "",
    userPassword: "",
    userImage: [],
    isActive: false,
    isSuperUser: false,
    isCook: false,
    isWaiter: false,
    isCashier: false,
    isGuest: false,
  });

  useEffect(() => {
    getDocumentTypes().then(setDocumentTypes);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.userEmail !== formData.confirmEmail) {
      setErrors((prev) => ({
        ...prev,
        confirmEmail: "Los correos electrónicos no coinciden",
      }));
      return;
    }

    const result = userSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    const newUser = {
      id: usersData.length + 1,
      ...result.data,
    };

    usersData.push(newUser);
    console.log("Usuario guardado:", usersData);

    navigate(-1);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Título con Icono */}
      <div className="flex items-center gap-3 mb-6">
        <UserPlus className="w-8 h-8 text-text-primary" />
        <h1 className="text-main font-heading font-bold text-text-primary">
          Registrar usuario
        </h1>
      </div>

      <div className="bg-[#B3B3B3] rounded-3xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="space-y-4">
            <Select
              label="Tipo de documento"
              name="userDocumentTypes"
              value={formData.userDocumentTypes}
              options={documentTypes}
              onChange={handleChange}
              error={errors.userDocumentTypes}
            />

            <Input
              label="Número de documento"
              name="userDocumentNumber"
              type="text"
              value={formData.userDocumentNumber}
              placeholder="Ingrese su documento"
              onChange={handleChange}
              error={errors.userDocumentNumber}
            />

            <Input
              label="Nombre completo"
              name="userName"
              type="text"
              value={formData.userName}
              placeholder="Ingrese su nombre"
              onChange={handleChange}
              error={errors.userName}
            />

            <div className="flex items-center gap-4 py-2">
              <span className="font-label text-text-primary text-small">Estado</span>
              <StatusSwitch
                checked={formData.isActive}
                onChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>

            <Input
              label="Correo electrónico"
              name="userEmail"
              type="email"
              value={formData.userEmail}
              placeholder="Ingrese correo"
              onChange={handleChange}
              error={errors.userEmail}
            />

            <Input
              label="Confirmar correo electrónico"
              name="confirmEmail"
              type="email"
              value={formData.confirmEmail}
              placeholder="Confirme correo"
              onChange={handleChange}
              error={errors.confirmEmail}
            />

            <div className="pt-2">
              <Button variant="primary" size="md">
                <span className="flex items-center gap-2">
                  Agregar correo <Plus className="w-4 h-4" />
                </span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-4">
            <div>
              <FileInput
                value={formData.userImage}
                onChange={(files) =>
                  setFormData((prev) => ({
                    ...prev,
                    userImage: files,
                  }))
                }
                multiple
              />
              {errors.userImage && (
                <span className="text-error text-caption block mt-1">
                  {errors.userImage}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <Input
                label="Dirección"
                name="address"
                type="text"
                value={formData.address}
                placeholder="Ingrese dirección"
                onChange={handleChange}
                error={errors.address}
              />

              <Input
                label="Número telefónico"
                name="userPhone"
                type="tel"
                value={formData.userPhone}
                placeholder="Ingrese número"
                onChange={handleChange}
                error={errors.userPhone}
              />

              <div className="pt-2">
                <Button variant="primary" size="md">
                  <span className="flex items-center gap-2">
                    Agregar Número Telefónico <Plus className="w-4 h-4" />
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between h-full">
            <div className="bg-[#8E8E8E] p-6 rounded-2xl text-text-inverse space-y-3 shadow-inner">
              <h3 className="font-heading text-subtitle mb-2">Tipo de Usuario:</h3>

              <Checkbox
                name="isSuperUser"
                label="Administrador"
                checked={formData.isSuperUser}
                onChange={handleChange}
              />

              <Checkbox
                name="isCook"
                label="Cocinero"
                checked={formData.isCook}
                onChange={handleChange}
              />

              <Checkbox
                name="isWaiter"
                label="Mesero"
                checked={formData.isWaiter}
                onChange={handleChange}
              />

              <Checkbox
                name="isCashier"
                label="Caja"
                checked={formData.isCashier}
                onChange={handleChange}
              />

              <Checkbox
                name="isGuest"
                label="Invitado"
                checked={formData.isGuest}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end mt-8">
              <Button type="submit" variant="primary" size="md">
                Crear Usuario
              </Button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}