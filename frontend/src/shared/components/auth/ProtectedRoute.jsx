// fronted/src/shared/components/auth/ProtectedRoute.jsx
// Bloquea las rutas privadas: sin token → login; con `permission` (código o lista, basta
// uno) y sin ese permiso → página "Sin acceso" en lugar del módulo. Solo es interfaz:
// el backend responde 403 de todas formas.

import { Link, Navigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/shared";
import { getToken, firstAllowedPath } from "@/services/apiClient";
import usePermission from "@/shared/hooks/usePermission";

function NoAccess() {
  const home = firstAllowedPath();
  return (
    <section
      className="bg-background rounded-shape-xl p-6 sm:p-10 border border-border/40 shadow-elevation-3 max-w-xl mx-auto mt-6 text-center flex flex-col items-center gap-4"
      aria-labelledby="no-access-title"
    >
      <span className="inline-grid place-items-center size-16 rounded-full bg-warning-container text-on-warning-container">
        <ShieldAlert className="size-8" aria-hidden="true" />
      </span>
      <h1 id="no-access-title" className="text-2xl font-heading font-bold text-text-primary">Sin acceso</h1>
      <p className="text-body text-text-secondary">
        Tu rol no tiene permiso para ver esta sección. Si crees que es un error, pide a un
        administrador que revise tus permisos.
      </p>
      <Button as={Link} to={home} variant="primary">
        {home === "/home" ? "Ir al inicio" : "Ir a un módulo permitido"}
      </Button>
    </section>
  );
}

export default function ProtectedRoute({ children, permission }) {
  const { canAny } = usePermission();

  if (!getToken()) {
    return <Navigate to="/auth" replace />;
  }

  if (permission && !canAny(permission)) {
    return <NoAccess />;
  }

  return children;
}
