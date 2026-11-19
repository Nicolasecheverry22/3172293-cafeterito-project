import { Outlet } from "react-router-dom";
import authBg from "@/assets/images/bg-1.png"; 

export default function AuthLayout() {
  return (
    <div
      // min-h-dvh: en móvil 100vh incluye la barra del navegador y provoca scroll.
      // p-4: margen compact de M3 (16px) para que la tarjeta no toque los bordes.
      className="min-h-dvh w-full flex items-center justify-center bg-background p-4"
      style={{
        backgroundImage: `url(${authBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Outlet />
    </div>
  );
}