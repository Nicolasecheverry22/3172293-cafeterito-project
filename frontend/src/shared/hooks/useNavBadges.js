// Contadores en vivo de la navegación (GET /api/dashboard/badges).
//  - Polling cada 60 s, en pausa mientras la pestaña está oculta (como el tablero); al
//    volver a la pestaña se refresca de inmediato.
//  - Se refresca también tras crear/editar/anular órdenes y cobrar/anular comprobantes
//    (orderApi e invoiceApi emiten NAV_BADGES_EVENT al resolverse).
//  - Sin ningún permiso con contador (p. ej. Invitado) no hace peticiones.
// Devuelve la respuesta del backend o null mientras no haya datos.
import { useEffect, useState } from "react";
import usePermission from "./usePermission";
import { getNavBadges, NAV_BADGES_EVENT } from "@/services/dashboardApi";

const POLL_MS = 60_000;
const BADGE_PERMISSIONS = ["list_order", "create_invoice", "prepare_order", "list_inventory"];

export default function useNavBadges() {
  const { user, canAny } = usePermission();
  const enabled = canAny(BADGE_PERMISSIONS);
  // Cambia al cambiar de usuario o de permisos (SESSION_EVENT): vuelve a consultar
  const sessionKey = `${user?.id}:${user?.isSuperuser}:${(user?.permissions ?? []).join(",")}`;
  const [badges, setBadges] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let inFlight = false;
    let again = false; // llegó un aviso durante la petición: se repite al terminar

    const load = async () => {
      if (document.visibilityState !== "visible") return;
      if (inFlight) {
        again = true;
        return;
      }
      inFlight = true;
      try {
        const next = await getNavBadges();
        if (!cancelled) setBadges(next);
      } catch {
        // Silencioso: los badges son secundarios; se reintenta en el próximo ciclo
      } finally {
        inFlight = false;
        if (again && !cancelled) {
          again = false;
          load();
        }
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") load();
    };

    const first = setTimeout(load, 0);
    const poll = setInterval(load, POLL_MS);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener(NAV_BADGES_EVENT, load);
    return () => {
      cancelled = true;
      clearTimeout(first);
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener(NAV_BADGES_EVENT, load);
    };
  }, [enabled, sessionKey]);

  return enabled ? badges : null;
}
