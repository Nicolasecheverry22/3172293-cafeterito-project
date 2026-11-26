import { useSearchParams } from "react-router-dom";
import { Info } from "lucide-react";
import LoginForm from "../components/LoginForm";
import { login as loginRequest } from "@/features/login/services/authService";
import imageLoginLight from "@/assets/images/image-login.png";
import imageLoginDark from "@/assets/images/image-login__black.png";
import useTheme from "@/shared/theme/useTheme";
import { firstAllowedPath, LOGOUT_REASONS } from "@/services/apiClient";

// Mensaje según el motivo del cierre forzado (?reason=..., ver endSession en apiClient)
const LOGOUT_MESSAGES = {
  [LOGOUT_REASONS.INACTIVITY]: "Tu sesión se cerró por inactividad. Inicia sesión de nuevo.",
  [LOGOUT_REASONS.UNAUTHORIZED]: "Tu sesión ya no es válida. Inicia sesión de nuevo.",
};

export default function LoginPage() {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const logoutMessage = LOGOUT_MESSAGES[searchParams.get("reason")];
  const imageLogin = theme === "dark" ? imageLoginDark : imageLoginLight;

  const handleLoginSubmit = async (credentials) => {
    // authService guarda el token y el usuario en la sesión
    await loginRequest({
      userEmail: credentials.email,
      userPassword: credentials.password,
    });

    // Primer módulo que su rol puede ver (o /home si no tiene ninguno)
    window.location.replace(firstAllowedPath());
  };

  return (
    // AuthLayout ya pone el fondo, el centrado y el alto de pantalla: aquí solo va la tarjeta.
    <div className="flex flex-col md:flex-row w-full max-w-5xl bg-background rounded-shape-xl shadow-elevation-3 overflow-hidden">
      <div className="hidden md:flex md:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-sm flex justify-center">
          <img src={imageLogin} alt="Ilustración de login" className="w-full h-auto max-h-[50dvh] object-contain" />
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center p-6 md:p-12">
        {/* M3 headline-l (32/40) en lugar de display (48px), que partía el título en dos líneas */}
        <h2 className="text-main leading-10 font-heading text-text-primary mb-2">
          Te damos la Bienvenida
        </h2>
        <p className="text-body text-text-secondary mb-6">
          Inicia sesión<br />
          Y disfruta la experiencia
        </p>

        {logoutMessage && (
          <p
            role="status"
            className="mb-4 flex items-start gap-2 rounded-md bg-warning-container text-on-warning-container px-4 py-3 text-body"
          >
            <Info className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
            {logoutMessage}
          </p>
        )}

        <LoginForm onSubmit={handleLoginSubmit} />
      </div>
    </div>
  );
}