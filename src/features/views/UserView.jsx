import { FormNavbar } from "@/shared";
import { useNavigate, useParams } from "react-router-dom";
import { Input, Button, StatusSwitch } from "@/shared";
import { SquarePen, UserRoundSearch, ArrowLeft } from "lucide-react";
import { users } from "../users/data/users";

export default function UserView() {
  const navigate = useNavigate();
  const { id } = useParams();

  const user = users.find((u) => u.id === Number(id));

  if (!user) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-background">
        <FormNavbar />
        <div className="max-w-4xl mx-auto mt-12 p-8 bg-surface-muted rounded-3xl shadow-sm border border-border text-center">
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
      </div>
    );
  }

  // Normalización de datos
  const isActive = user.isActive ?? user.is_active ?? true;
  const userName = user.userName ?? user.name ?? "";
  const userDocument = user.userDocument ?? user.documentNumber ?? "N/A";
  const userAddress = user.userAddress ?? user.address ?? "N/A";
  const userPhone = user.userPhone ?? user.phone ?? "N/A";
  const userEmail = user.userEmail ?? user.email ?? "";
  const userRole = user.userRole ?? user.role ?? user.roleName ?? "N/A";

  const initial = userName ? userName.charAt(0).toUpperCase() : "U";
  const colors = [
    "#E57373", "#F06292", "#BA68C8", "#9575CD",
    "#7986CB", "#64B5F6", "#4DB6AC", "#81C784",
    "#FFD54F", "#FF8A65",
  ];
  const bgColor = colors[user.id % colors.length];

  return (
    <div className="min-h-screen w-full flex flex-col bg-background pb-12">

      <div className="max-w-7xl w-full mx-auto px-6 mt-8 mb-6 flex items-center gap-3">
        <UserRoundSearch className="w-9 h-9 text-text-primary" />
        <h1 className="text-main font-heading font-bold text-text-primary text-2xl">
          Visualizar Usuario
        </h1>
      </div>

      <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Estado */}
        <div className="bg-surface-muted rounded-3xl p-6 shadow-sm border border-border/50 flex flex-col items-center gap-4 text-center">
          <p className="text-text-primary font-heading font-bold text-lg">
            Estado
          </p>
          <StatusSwitch
            size="lg"
            checked={Boolean(isActive)}
            disabled
          />
        </div>

        {/* Información del Usuario */}
        <div className="lg:col-span-2 bg-surface-muted rounded-3xl p-8 shadow-sm border border-border/50 flex flex-col items-center gap-8">
          
          <div
            className="shadow-md transition-transform hover:scale-105"
            style={{
              backgroundColor: bgColor,
              width: "130px",
              height: "130px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "56px",
              fontWeight: "bold",
              color: "#fff",
              userSelect: "none",
            }}
          >
            {initial}
          </div>

          <div className="bg-surface rounded-2xl p-6 shadow-sm w-full border border-border/40 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre Completo"
              name="nameInfo"
              type="text"
              value={userName}
              disabled
            />
            <Input
              label="Cédula de Ciudadanía"
              name="documentNumberInfo"
              type="text"
              value={userDocument}
              disabled
            />
            <Input
              label="Dirección"
              name="addressInfo"
              type="text"
              value={userAddress}
              disabled
            />
            <Input
              label="Teléfono"
              name="phoneInfo"
              type="text"
              value={userPhone}
              disabled
            />
            <Input
              label="Rol"
              name="roleInfo"
              type="text"
              value={userRole}
              disabled
            />
            <Input
              label="Correo Electrónico"
              name="emailInfo"
              type="email"
              value={userEmail}
              disabled
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="bg-surface-muted rounded-3xl p-6 shadow-sm border border-border/50 flex flex-col items-center gap-4 text-center">
          <p className="text-text-primary font-heading font-bold text-lg">
            Acciones
          </p>
          <Button
            variant="secondary"
            type="button"
            size="md"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => navigate(`/EditUser/${user.id}`)}
          >
            <SquarePen className="w-5 h-5" />
            Editar Perfil
          </Button>
        </div>

      </div>
    </div>
  );
}