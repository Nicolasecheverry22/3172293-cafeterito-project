import { Outlet } from "react-router-dom";
import mainBg from "@/assets/images/bg-3.jpg";
import FormNavbar from "../components/FormNavbar";
import SessionTimeout from "@/features/login/components/SessionTimeout";

export default function MainLayout() {
  return (
    <div
      className="relative min-h-screen w-full flex flex-col bg-cover bg-center bg-no-repeat bg-fixed [image-rendering:-webkit-optimize-contrast]"
      style={{ backgroundImage: `url(${mainBg})` }}
    >
      {/* Superposición oscura y borrosa adaptada a la altura completa */}
      <div className="min-h-screen w-full flex flex-col bg-black/55 backdrop-brightness-75 z-0">
        <SessionTimeout />
        <FormNavbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}