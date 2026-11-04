import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import imageLogin from "@/assets/images/image-login.png";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [wasSent, setWasSent] = useState(false);

  const handleForgotSubmit = async ({ email }) => {

    console.log("Solicitud de recuperación para:", email);


    setWasSent(true);

    setTimeout(() => navigate("/auth/verifyToken"), 1800);
  };

  return (
    <div className="flex flex-col md:flex-row w-full max-w-5xl bg-background rounded-2xl shadow-xl overflow-hidden relative">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 p-2 text-text-primary hover:text-brand transition-colors z-10 cursor-pointer"
        aria-label="Volver"
      >
        <ArrowLeft className="w-8 h-8 stroke-[2.5]" />
      </button>

      <div className="hidden md:flex md:w-1/2 items-center justify-center p-8 bg-surface-muted/10">
        <div className="w-full max-w-sm flex justify-center">
          <img src={imageLogin} className="w-full h-auto object-contain" alt="Recuperar contraseña" />
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 bg-background">
        <h2 className="text-display font-heading font-bold text-text-primary mb-4">
          ¿Olvidaste tu contraseña?
        </h2>

        <p className="text-body text-text-secondary mb-10 pr-4">
          Ingresa tu dirección de correo electrónico para restablecer una nueva contraseña.
        </p>

        {wasSent ? (
          <div
            className="rounded-lg border p-4 text-body text-text-primary"
            role="status"
          >
            Se ha enviado un correo de restablecimiento.
          </div>
        ) : (
          <ForgotPasswordForm onSubmit={handleForgotSubmit} />
        )}

        <div className="mt-8 text-center">
          <p className="text-small text-text-muted">
            ¿Recordaste tu contraseña?{" "}
            <span
              onClick={() => navigate("/auth")}
              className="text-text-primary font-bold cursor-pointer hover:underline"
            >
              Iniciar sesión
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}