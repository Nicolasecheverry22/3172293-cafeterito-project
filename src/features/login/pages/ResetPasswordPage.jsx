import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ResetPasswordForm from "../components/ResetPasswordForm";

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
    console.log("Nueva contraseña para token:", token, newPassword);
    navigate("/auth");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-surface-muted/30">
      <div className="w-full max-w-3xl bg-background rounded-2xl shadow-xl overflow-hidden p-8 md:p-16 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-full max-w-md flex flex-col items-center text-center">

          {tokenStatus === "checking" && (
            <p className="text-body text-text-secondary">Verificando enlace...</p>
          )}

          {tokenStatus === "invalid" && (
            <>
              <h2 className="text-display font-heading font-bold text-text-primary mb-4">
                Enlace no válido
              </h2>
              <p className="text-body text-error mb-8" role="alert">
                Este enlace de recuperación es inválido o ha expirado. Solicita uno nuevo.
              </p>
              <button
                onClick={() => navigate("/auth/ResetPassword")}
                className="text-text-primary font-bold cursor-pointer hover:underline"
              >
                Solicitar nuevo enlace
              </button>
            </>
          )}

          {tokenStatus === "valid" && (
            <>
              <h2 className="text-display font-heading font-bold text-text-primary mb-4">
                Cambiar contraseña
              </h2>
              <p className="text-body text-text-secondary mb-10">
                Escriba su nueva contraseña
              </p>
              <ResetPasswordForm onSubmit={handleResetSubmit} />
            </>
          )}

        </div>
      </div>
    </div>
  );
}