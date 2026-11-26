// Mi perfil (BEM: profile). Cualquier usuario autenticado, sin permisos especiales.
// Editable: nombre, teléfono, dirección, correo personal, foto y contraseña.
// Solo lectura: correo de acceso, documento y rol (los cambia un administrador).
import { useEffect, useState } from "react";
import { z } from "zod";
import { UserCircle, KeyRound, Save, Mail, IdCard, ShieldCheck } from "lucide-react";
import { Button, Input, FileInput, ImageThumb } from "@/shared";
import { getMe, updateMe, changeMyPassword } from "@/services/userApi";
import { updateSessionUser } from "@/services/apiClient";
import { getDocumentTypeLabel } from "@/services/selectService";
import {
  buildImagePayload, imageFilesField, IMAGE_ACCEPT, IMAGE_HINT, validateImageFile,
} from "@/shared/utils/image";
import { showSuccessAlert, showSystemErrorAlert } from "@/shared/services/alertService";
import { DataConsentStatus } from "@/shared/components/DataPolicyLink";

// Mismas reglas que el backend (user.schema.js: updateMeSchema y RNF10)
const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/;
const profileSchema = z.object({
  userName: z.string().trim()
    .min(3, "El nombre debe tener mínimo 3 caracteres")
    .max(100, "El nombre es demasiado largo")
    .regex(NAME_REGEX, "El nombre solo puede contener letras y espacios"),
  userPhone: z.string().trim().regex(/^\d{7,15}$/, "El teléfono debe tener entre 7 y 15 dígitos"),
  userAddress: z.string().trim()
    .refine((v) => v === "" || (v.length >= 10 && v.length <= 100), "La dirección debe tener entre 10 y 100 caracteres"),
  userPersonalEmail: z.string().trim()
    .refine((v) => v === "" || z.email().safeParse(v).success, "Debe ingresar un correo válido"),
  userImage: imageFilesField(),
});

const PASSWORD_RULES = [
  [(v) => v.length >= 10 && v.length <= 64, "Entre 10 y 64 caracteres"],
  [(v) => /[A-Z]/.test(v), "Una mayúscula"],
  [(v) => /[a-z]/.test(v), "Una minúscula"],
  [(v) => /[0-9]/.test(v), "Un número"],
  [(v) => /[^A-Za-z0-9\s]/.test(v), "Un símbolo"],
];
const EMPTY_PASSWORDS = { currentPassword: "", newPassword: "", confirmPassword: "" };

const issuesToErrors = (issues) => Object.fromEntries(issues.map((i) => [i.path[0], i.message]));

export default function ProfilePage() {
  const [me, setMe] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [form, setForm] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    getMe()
      .then((data) => {
        setMe(data);
        setForm({
          userName: data.userName ?? "",
          userPhone: data.userPhone ?? "",
          userAddress: data.userAddress ?? "",
          userPersonalEmail: data.userPersonalEmail ?? "",
          userImage: [],
        });
      })
      .catch((err) => setLoadError(err.message));
  }, []);

  if (loadError) {
    return <p className="profile__error" role="alert">No se pudo cargar tu perfil: {loadError}</p>;
  }
  if (!form) return <p className="profile__loading">Cargando perfil...</p>;

  const setField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const result = profileSchema.safeParse(form);
    if (!result.success) return setErrors(issuesToErrors(result.error.issues));

    setErrors({});
    setIsSaving(true);
    try {
      const { userImage, ...fields } = result.data;
      const imageFields = await buildImagePayload("userImage", userImage, { removed: imageRemoved });
      const saved = await updateMe({ ...fields, ...imageFields });

      // Barra superior: nombre y avatar nuevos (SESSION_EVENT)
      updateSessionUser({ name: saved.name, imageThumb: saved.imageThumb });
      const fresh = await getMe();
      setMe(fresh);
      setForm((prev) => ({ ...prev, userImage: [] }));
      setImageRemoved(false);
      await showSuccessAlert({ title: "Perfil actualizado", text: "Tus datos se guardaron correctamente." });
    } catch (err) {
      await showSystemErrorAlert({ text: err.message || "No se pudo actualizar tu perfil." });
    } finally {
      setIsSaving(false);
    }
  };

  const setPassword = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) setPasswordErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const next = {};
    if (!passwords.currentPassword) next.currentPassword = "Ingresa tu contraseña actual";
    const failed = PASSWORD_RULES.filter(([test]) => !test(passwords.newPassword));
    if (failed.length) next.newPassword = `Falta: ${failed.map(([, label]) => label.toLowerCase()).join(", ")}`;
    if (passwords.confirmPassword !== passwords.newPassword) next.confirmPassword = "Las contraseñas no coinciden";
    if (Object.keys(next).length) return setPasswordErrors(next);

    setIsChangingPassword(true);
    try {
      await changeMyPassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords(EMPTY_PASSWORDS);
      setPasswordErrors({});
      await showSuccessAlert({ title: "Contraseña actualizada", text: "Úsala la próxima vez que inicies sesión." });
    } catch (err) {
      if (err.status === 400 && /actual/.test(err.message)) setPasswordErrors({ currentPassword: err.message });
      else await showSystemErrorAlert({ text: err.message || "No se pudo cambiar la contraseña." });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const document = me.userDocument
    ? `${getDocumentTypeLabel(me.userDocumentTypes)} ${me.userDocument}`.trim()
    : "Sin documento";
  const roles = me.groups?.length ? me.groups : ["Sin rol"];
  const currentThumb = imageRemoved ? null : me.userImageThumb;

  return (
    <div className="profile">
      <header className="profile__header">
        <UserCircle className="profile__header-icon" aria-hidden="true" />
        <div>
          <h1 className="profile__title">Mi perfil</h1>
          <p className="profile__subtitle">Consulta tus datos y actualiza tu información personal.</p>
        </div>
      </header>

      <div className="profile__layout">
        {/* Tarjeta de identidad (solo lectura) */}
        <aside className="profile__card" aria-label="Datos de la cuenta">
          <ImageThumb src={currentThumb} name={me.userName} size="lg" round alt={`Foto de ${me.userName}`} />
          <p className="profile__name">{me.userName}</p>
          <div className="profile__roles" aria-label="Rol">
            {roles.map((role) => (
              <span key={role} className="profile__role">{role}</span>
            ))}
            {me.isSuperuser && <span className="profile__role profile__role--super">Superusuario</span>}
          </div>
          <p className="profile__note">Solo un administrador puede cambiar tu rol.</p>

          <dl className="profile__facts">
            <div className="profile__fact">
              <dt><Mail aria-hidden="true" /> Correo de acceso</dt>
              <dd>{me.userEmail}</dd>
            </div>
            <div className="profile__fact">
              <dt><IdCard aria-hidden="true" /> Documento</dt>
              <dd>{document}</dd>
            </div>
            <div className="profile__fact">
              <dt><ShieldCheck aria-hidden="true" /> Estado</dt>
              <dd>{me.is_active ? "Activo" : "Inactivo"}</dd>
            </div>
          </dl>
          <p className="profile__note">El correo de acceso y el documento los actualiza un administrador.</p>
          <DataConsentStatus consentAt={me.dataConsentAt} policyUrl={me.dataPolicyUrl} />
        </aside>

        <div className="profile__main">
          {/* Datos editables */}
          <form className="profile__section" onSubmit={handleSave} noValidate aria-labelledby="profile-data-title">
            <h2 id="profile-data-title" className="profile__section-title">Datos personales</h2>
            <div className="profile__grid">
              <Input label="Nombre completo" htmlFor="profile-name" name="userName" value={form.userName} onChange={setField} error={errors.userName} autoComplete="name" />
              <Input label="Teléfono" htmlFor="profile-phone" name="userPhone" type="tel" inputMode="numeric" value={form.userPhone} onChange={setField} error={errors.userPhone} autoComplete="tel" />
              <Input label="Dirección (opcional)" htmlFor="profile-address" name="userAddress" value={form.userAddress} onChange={setField} error={errors.userAddress} autoComplete="street-address" />
              <Input label="Correo personal (opcional)" htmlFor="profile-personal-email" name="userPersonalEmail" type="email" value={form.userPersonalEmail} onChange={setField} error={errors.userPersonalEmail} autoComplete="email" />
            </div>

            <div className="profile__photo">
              <p className="profile__label">Foto de perfil</p>
              <FileInput
                value={form.userImage}
                onChange={(files) => {
                  setForm((prev) => ({ ...prev, userImage: files }));
                  if (errors.userImage) setErrors((prev) => ({ ...prev, userImage: undefined }));
                }}
                existingUrl={imageRemoved ? null : me.userImage}
                onRemoveExisting={() => setImageRemoved(true)}
                accept={IMAGE_ACCEPT}
                validateFile={validateImageFile}
                hint={IMAGE_HINT}
                error={errors.userImage}
                label="Cambiar foto"
              />
            </div>

            <div className="profile__actions">
              <Button variant="primary" type="submit" disabled={isSaving} className="gap-2">
                <Save className="size-5" aria-hidden="true" />
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>

          {/* Contraseña */}
          <form className="profile__section" onSubmit={handlePasswordChange} noValidate aria-labelledby="profile-password-title">
            <h2 id="profile-password-title" className="profile__section-title">
              <KeyRound aria-hidden="true" /> Cambiar contraseña
            </h2>
            <div className="profile__grid">
              <Input label="Contraseña actual" htmlFor="profile-current-password" name="currentPassword" type="password" value={passwords.currentPassword} onChange={setPassword} error={passwordErrors.currentPassword} autoComplete="current-password" />
              <span className="profile__spacer" aria-hidden="true" />
              <Input label="Nueva contraseña" htmlFor="profile-new-password" name="newPassword" type="password" value={passwords.newPassword} onChange={setPassword} error={passwordErrors.newPassword} autoComplete="new-password" aria-describedby="profile-password-rules" />
              <Input label="Confirmar nueva contraseña" htmlFor="profile-confirm-password" name="confirmPassword" type="password" value={passwords.confirmPassword} onChange={setPassword} error={passwordErrors.confirmPassword} autoComplete="new-password" />
            </div>
            <ul id="profile-password-rules" className="profile__rules" aria-label="Requisitos de la contraseña">
              {PASSWORD_RULES.map(([test, label]) => {
                const met = test(passwords.newPassword);
                return (
                  <li key={label} className={`profile__rule ${met ? "profile__rule--met" : ""}`}>
                    <span aria-hidden="true">{met ? "✓" : "•"}</span> {label}
                    <span className="sr-only">{met ? " (cumplido)" : " (pendiente)"}</span>
                  </li>
                );
              })}
            </ul>
            <div className="profile__actions">
              <Button variant="primary" type="submit" disabled={isChangingPassword} className="gap-2">
                <KeyRound className="size-5" aria-hidden="true" />
                {isChangingPassword ? "Actualizando..." : "Actualizar contraseña"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
