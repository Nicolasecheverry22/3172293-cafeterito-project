import { Outlet } from "react-router-dom";
import mainBg from "@/assets/images/bg-3.jpg";
import FormNavbar from "../components/FormNavbar";

export default function MainLayout() {
  return (
    <div
      className="relative min-h-screen w-full flex flex-col bg-cover bg-center bg-no-repeat bg-fixed [image-rendering:-webkit-optimize-contrast]"
      style={{ backgroundImage: `url(${mainBg})` }}
    >
      {/* Superposición oscura y borrosa adaptada a la altura completa */}
      <div className="min-h-screen w-full flex flex-col bg-black/55 backdrop-brightness-75 z-0">
        <FormNavbar />
        {/* Márgenes M3: 16px en compact (< 600px), 24px desde medium */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}