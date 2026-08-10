import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function FormNavbar() {
const navigate = useNavigate();

return (
    <header className="bg-brand w-full px-6 py-3 flex items-center justify-between shadow-md relative z-50">
    <button
        type="button"
        onClick={() => navigate(-1)}
        className="p-2 rounded-md text-text-primary hover:bg-brand-hover transition-colors flex items-center gap-2 focus:outline-none cursor-pointer"
        aria-label="Volver a la página anterior"
    >
        <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
        <span className="font-medium text-text-primary">Volver</span>
    </button>

    </header>
  );
}