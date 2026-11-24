// Permisos del usuario en sesión para la interfaz (login/refresh guardan isSuperuser y
// permissions). El backend SIEMPRE vuelve a verificar: esto solo habilita o deshabilita.
import { useEffect, useState } from "react";
import { getSessionUser, SESSION_EVENT } from "@/services/apiClient";

// Usuario en sesión; se actualiza al iniciar sesión, al refrescar el token, al editar el
// propio perfil o al cambiar los permisos del propio grupo (SESSION_EVENT).
export function useSessionUser() {
  const [user, setUser] = useState(getSessionUser);
  useEffect(() => {
    const sync = () => setUser(getSessionUser());
    window.addEventListener(SESSION_EVENT, sync);
    return () => window.removeEventListener(SESSION_EVENT, sync);
  }, []);
  return user;
}

/**
 * const { can, canAny, guard } = usePermission();
 * - can("create_user") / canAny(["update_order", "prepare_order"]): el superusuario siempre puede.
 * - guard(codes, "crear usuarios"): props para una acción SIN permiso — se renderiza
 *   deshabilitada (no se oculta) con el tooltip "No tienes permiso para crear usuarios".
 *   Con permiso devuelve {} y el botón queda igual.
 */
export default function usePermission() {
  const user = useSessionUser();
  const isSuperuser = Boolean(user?.isSuperuser);
  const granted = user?.permissions ?? [];

  const canAny = (codes) => isSuperuser || [].concat(codes).some((code) => granted.includes(code));
  const can = canAny;
  const guard = (codes, action) =>
    canAny(codes)
      ? {}
      : { disabled: true, "aria-disabled": true, title: `No tienes permiso para ${action}` };

  return { user, isSuperuser, can, canAny, guard };
}
