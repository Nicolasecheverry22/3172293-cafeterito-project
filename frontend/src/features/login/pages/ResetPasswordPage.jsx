import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ResetPasswordForm from "../components/ResetPasswordForm";
import { resetPassword } from "../services/authService";
import { showSuccessAlert, showSystemErrorAlert } from "@/shared/services/alertService";

async function validateResetToken(token) {
  if (!token) return false;
  
  return /^\d{6}$/.test(token);;
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [tokenStatus, setTokenStatus] = useState("checking"); 

  useEffect(() => {
    let isMounted = true;
    validateResetToken(token).then((isValid) => {
      if (isMounted) setTokenStatus(isValid ? "valid" : "invalid");
    });
    return () => { isMounted = false; };
  }, [token]);

  const handleResetSubmit = async (newPassword) => {
    try {
      // El backend valida el código (vigente, de un solo uso) y la política RNF10
      await resetPassword(token, newPassword);
      await showSuccessAlert({
        title: "Contraseña actualizada",
        text: "Ya puedes iniciar sesión con tu nueva contraseña.",
      });
      navigate("/auth");
    } catch (error) {
      await showSystemErrorAlert({ text: error.message });
    }
  };

  return (
    // AuthLayout ya pone el fondo, el centrado y el alto de pantalla: aquí solo va la tarjeta.
    <div className="w-full max-w-3xl bg-background rounded-shape-xl shadow-elevation-3 overflow-hidden p-6 md:p-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-md flex flex-col items-center text-center">

        {tokenStatus === "checking" && (
          <p className="text-body text-text-secondary">Verificando enlace...</p>
        )}

        {tokenStatus === "invalid" && (
          <>
            <h2 className="text-main leading-10 font-heading text-text-primary mb-2">
              Enlace no válido
            </h2>
            <p className="text-body text-error mb-6" role="alert">
              Este enlace de recuperación es inválido o ha expirado. Solicita uno nuevo.
            </p>
            <button
              type="button"
              onClick={() => navigate("/auth/resetPassword")}
              className="inline-flex items-center min-h-touch px-2 text-text-primary font-bold cursor-pointer hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              Solicitar nuevo enlace
            </button>
          </>
        )}

        {tokenStatus === "valid" && (
          <>
            <h2 className="text-main leading-10 font-heading text-text-primary mb-2">
              Cambiar contraseña
            </h2>
            <p className="text-body text-text-secondary mb-6">
              Escriba su nueva contraseña
            </p>
            <ResetPasswordForm onSubmit={handleResetSubmit} />
          </>
        )}

      </div>
    </div>
  );
}