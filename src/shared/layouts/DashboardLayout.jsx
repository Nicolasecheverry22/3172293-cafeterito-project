import { Outlet } from "react-router-dom";
import { Navbar, Footer } from "@/shared"; 
import dashBg from "@/assets/images/bg-2.jpg";

export default function DashboardLayout() {
  return (
    <div
      className="relative min-h-screen w-full flex flex-col bg-cover bg-center bg-no-repeat [image-rendering:-webkit-optimize-contrast]"
      style={{ backgroundImage: `url(${dashBg})` }}
    >
      {/* CAPA DE OSCURECIMIENTO GLOBAL (Overlay) */}
      <div className="absolute inset-0 bg-black/55 backdrop-brightness-75 z-0" />

      {/* CONTENIDO DEL DASHBOARD */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* Aquí se renderizan todas las vistas hijas */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
          <Outlet />
        </main>

        {/* Footer si aplica */}
        <Footer/>
      </div>
    </div>
  );
}