import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import imageLoginLight from "@/assets/images/image-login.png";
import imageLoginDark from "@/assets/images/image-login__black.png";
import useTheme from "@/shared/theme/useTheme";
import { requestPasswordReset } from "../services/authService";
import { showSystemErrorAlert } from "@/shared/services/alertService";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const imageLogin = theme === "dark" ? imageLoginDark : imageLoginLight;
  const [wasSent, setWasSent] = useState(false);

  const handleForgotSubmit = async ({ email }) => {
    try {
      // El backend responde igual exista o no el correo (no revela usuarios)
      await requestPasswordReset(email);
      setWasSent(true);
      setTimeout(() => navigate("/auth/verifyToken"), 1800);
    } catch (error) {
      await showSystemErrorAlert({ text: error.message });
    }
  };

  return (
    // Mismo ajuste que LoginPage: M3 headline-l, padding 24/48px y foco en que quepa sin scroll
    <div className="flex flex-col md:flex-row w-full max-w-5xl bg-background rounded-shape-xl shadow-elevation-3 overflow-hidden relative">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 size-touch flex items-center justify-center rounded-full text-text-primary hover:bg-surface-muted transition-colors z-10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        aria-label="Volver"
      >
        <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
      </button>

      <div className="hidden md:flex md:w-1/2 items-center justify-center p-8 bg-surface-muted/10">
        <div className="w-full max-w-sm flex justify-center">
          <img src={imageLogin} className="w-full h-auto max-h-[50dvh] object-contain" alt="Recuperar contraseña" />
        </div>
      </div>

      {/* pt-20 en móvil: deja sitio al botón Volver (en md queda sobre la ilustración) */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 pb-6 pt-20 md:p-12 bg-background">
        <h2 className="text-main leading-10 font-heading text-text-primary mb-2">
          ¿Olvidaste tu contraseña?
        </h2>

        <p className="text-body text-text-secondary mb-6">
          Ingresa tu dirección de correo electrónico para restablecer una nueva contraseña.
        </p>

        {wasSent ? (
          <div
            className="rounded-shape-md border border-border p-4 text-body text-text-primary"
            role="status"
          >
            Si el correo está registrado, recibirás un código de 6 dígitos para restablecer tu contraseña.
          </div>
        ) : (
          <ForgotPasswordForm onSubmit={handleForgotSubmit} />
        )}

        <div className="mt-4 text-center">
          <p className="text-small text-text-muted">
            ¿Recordaste tu contraseña?{" "}
            {/* button (no span): enfocable con Tab y con área táctil de 48px */}
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="inline-flex items-center min-h-touch px-1 text-text-primary font-bold cursor-pointer hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              Iniciar sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}