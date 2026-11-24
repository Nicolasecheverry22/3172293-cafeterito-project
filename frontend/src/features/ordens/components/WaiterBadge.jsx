// Empleado encargado: siempre el usuario en sesión (el backend lo toma del token).
import { UserRound } from "lucide-react";
import { ImageThumb } from "@/shared";

export default function WaiterBadge({ user }) {
  const name = user?.name || user?.email || "Usuario en sesión";
  return (
    <div className="waiter-badge">
      <ImageThumb src={user?.imageThumb} name={name} icon={UserRound} size="sm" round alt="" />
      <div className="waiter-badge__text">
        <span className="waiter-badge__label">Atiende</span>
        <span className="waiter-badge__name">{name}</span>
      </div>
    </div>
  );
}
