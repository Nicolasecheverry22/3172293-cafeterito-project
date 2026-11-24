import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input, Button, StatusSwitch, ImageThumb } from "@/shared";
import { SquarePen, UserRoundSearch, ArrowLeft } from "lucide-react";
import { getUserById } from "@/services/userApi";
import { getDocumentTypeLabel } from "@/services/selectService";
import usePermission from "@/shared/hooks/usePermission";

export default function UserView() {
  const { guard } = usePermission();
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getUserById(id)
      .then(setUser)
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto mt-12 p-4 sm:p-6 md:p-8 bg-surface-muted rounded-shape-xl shadow-elevation-1 border border-border text-center">
        <UserRoundSearch className="w-12 h-12 text-error mx-auto mb-4" />
        <h1 className="text-main font-heading font-bold text-text-primary mb-2">
          Usuario no encontrado
        </h1>
        <p className="text-text-secondary mb-6">
          El usuario solicitado no existe o fue removido.
        </p>
        <Button variant="secondary" onClick={() => navigate("/userList")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver a la lista
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p className="text-text-secondary">Cargando usuario...</p>
      </div>
    );
  }

  const userName = user.userName ?? "";
  const roles = user.groups?.length ? user.groups.join(", ") : "Sin rol asignado";

  return (
    <div className="bg-surface/70 dark:bg-surface/90 backdrop-blur-md rounded-shape-xl p-4 sm:p-6 md:p-8 border border-border/40 shadow-elevation-3">

      <div className="max-w-7xl w-full mx-auto px-0 sm:px-6 mt-8 mb-12 flex items-center gap-3">
        <UserRoundSearch className="w-9 h-9 text-text-primary" />
        <h1 className="text-main font-heading font-bold text-text-primary text-2xl">
          Visualizar Usuario
        </h1>
      </div>

      <div className="max-w-7xl w-full mx-auto px-0 sm:px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

        {/* Estado */}
        <div className="bg-surface-muted rounded-shape-xl p-4 sm:p-6 shadow-elevation-1 border border-border/50 flex flex-col items-center gap-4 text-center">
          <p className="text-text-primary font-heading font-bold text-lg">
            Estado
          </p>
          <StatusSwitch size="lg" checked={Boolean(user.is_active)} disabled />
        </div>

        {/* Información del Usuario */}
        <div className="lg:col-span-2 bg-surface-muted rounded-shape-xl p-4 sm:p-6 md:p-8 shadow-elevation-1 border border-border/50 flex flex-col items-center gap-8">

          {/* Foto de perfil o, si no tiene, sus iniciales */}
          <ImageThumb
            src={user.userImage}
            alt={`Foto de ${userName || "usuario"}`}
            name={userName || "Usuario"}
            size="lg"
            round
            className="shadow-elevation-2"
          />

          <div className="bg-surface rounded-shape-lg p-4 sm:p-6 shadow-elevation-1 w-full border border-border/40 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nombre Completo" name="nameInfo" type="text" value={userName} disabled />
            <Input
              label="Tipo de documento"
              name="documentTypeInfo"
              type="text"
              value={getDocumentTypeLabel(user.userDocumentTypes) || "N/A"}
              disabled
            />
            <Input
              label="Número de documento"
              name="documentNumberInfo"
              type="text"
              value={user.userDocument ?? "N/A"}
              disabled
            />
            <Input
              label="Teléfono"
              name="phoneInfo"
              type="text"
              value={user.userPhone ?? "N/A"}
              disabled
            />
            <Input label="Rol" name="roleInfo" type="text" value={roles} disabled />
            <Input
              label="Fecha de registro"
              name="createdAtInfo"
              type="text"
              value={user.createdAt ? user.createdAt.split("-").reverse().join("/") : "N/A"}
              disabled
            />
            <div className="md:col-span-2">
              <Input
                label="Correo Electrónico"
                name="emailInfo"
                type="email"
                value={user.userEmail ?? ""}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="bg-surface-muted rounded-shape-xl p-4 sm:p-6 shadow-elevation-1 border border-border/50 flex flex-col items-center gap-4 text-center">
          <p className="text-text-primary font-heading font-bold text-lg">
            Acciones
          </p>
          <Button
            variant="tertiary"
            type="button"
            size="md"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => navigate(`/EditUser/${user.id}`)}
              {...guard("update_user", "editar usuarios")}
          >
            <SquarePen className="w-5 h-5" />
            Editar Perfil
          </Button>
        </div>

      </div>
    </div>
  );
}
