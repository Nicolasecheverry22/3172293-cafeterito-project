import { useState } from "react";
import { Input, 
    Select, 
    Checkbox, 
    Button, 
    FileInput, 
    StatusSwitch 
} from "@/shared";
import { createUserSchema } from "../schemas/userSchema";

const ROLE_CHECKBOXES = [
  { name: "isSuperUser", label: "Administrador" },
  { name: "isCook", label: "Cocinero" },
  { name: "isWaiter", label: "Mesero" },
  { name: "isCashier", label: "Caja" },
  { name: "isGuest", label: "Invitado" },
];

const DEFAULT_FORM_DATA = {
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
  startDate: "",
  endDate: "",
};

export default function UserForm({
  mode = "create", 
  initialData = null,
  currentUserId = null,
  documentTypes = [],
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState(initialData ?? DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = formData.isSuperUser;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.userEmail !== formData.confirmEmail) {
      setErrors((prev) => ({ ...prev, confirmEmail: "Los correos electrónicos no coinciden" }));
      return;
    }

    const schema = createUserSchema({ currentUserId });
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
            onChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
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

        {mode === "create" && (
          <Input
            label="Contraseña"
            name="userPassword"
            type="password"
            value={formData.userPassword}
            placeholder="Ingrese contraseña"
            onChange={handleChange}
            error={errors.userPassword}
          />
        )}
      </div>

      <div className="flex flex-col justify-between space-y-4">
        <div>
          <FileInput
            value={formData.userImage}
            onChange={(files) => setFormData((prev) => ({ ...prev, userImage: files }))}
            multiple
          />
          {errors.userImage && (
            <span className="text-error text-caption block mt-1">{errors.userImage}</span>
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
        </div>
      </div>

      <div className="flex flex-col justify-between h-full">
        <div className="bg-surface-inverse/70 p-6 rounded-2xl text-text-inverse space-y-3 shadow-inner">
          <h3 className="font-heading text-subtitle mb-2">Tipo de Usuario:</h3>

          {ROLE_CHECKBOXES.map(({ name, label }) => (
            <Checkbox key={name} name={name} label={label} checked={formData[name]} onChange={handleChange} />
          ))}

          {errors.isSuperUser && (
            <span className="text-error text-caption block">{errors.isSuperUser}</span>
          )}

          {!isAdmin && (
            <div className="pt-3 space-y-3 border-t border-border-strong/40 mt-3">
              <Input
                label="Fecha de inicio"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                error={errors.startDate}
              />
              <Input
                label="Fecha de finalización"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                error={errors.endDate}
              />
            </div>
          )}
        </div>

        <div className="flex gap-4 items-center justify-end mt-4">
          <Button variant="secondary" size="sm" type="button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : mode === "edit" ? "Guardar Cambios" : "Crear Usuario"}
          </Button>
        </div>
      </div>
    </form>
  );
}