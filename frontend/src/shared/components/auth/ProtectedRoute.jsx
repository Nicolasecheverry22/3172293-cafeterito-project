// fronted/src/shared/components/auth/ProtectedRoute.jsx
// Bloquea el acceso a rutas privadas si no hay token en sessionStorage

import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
