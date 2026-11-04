import { useNavigate, useParams } from "react-router-dom";
import { Input, Button, StatusSwitch } from "@/shared";
import { SquarePen, UtensilsCrossed } from "lucide-react";
import { inventory } from "../inventory/data/inventory";

export default function ProvisionsView() {
  const navigate = useNavigate();
  const { id } = useParams();

  const provision = inventory.find((p) => String(p.id) === String(id));

  if (!provision) {
    return (
      <div className="min-h-screen w-full flex flex-col">
        <div className="flex items-center gap-3 mt-10 ml-12">
          <UtensilsCrossed className="w-10 h-10 text-text-primary" />
          <h1 className="text-main font-heading font-bold text-text-primary">
            Visualizar Suministro
          </h1>
        </div>
        <p className="ml-12 mt-8 text-red-500">Suministro no encontrado.</p>
      </div>
    );
  }

  const provisionName =
    provision.provisionName || provision.provisionName || provision.nameprovision || "Suministro";

  // Lote del suministro
  const batchNumber = provision.batch || provision.lot || provision.lote || "LOT-101A";

  // Iniciales dinámicas para el avatar
  const getInitials = (name) => {
    if (!name) return "S";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-surface/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-border/40 shadow-2xl">
      {/* Encabezado Principal */}
      <div className="max-w-7xl w-full mx-auto px-6 mt-8 mb-6 flex items-center gap-3">
        <UtensilsCrossed className="w-9 h-9 text-text-primary" />
        <h1 className="text-main font-heading font-bold text-text-primary text-2xl">
          Visualizar Suministro de Inventario
        </h1>
      </div>

      {/* Grid Responsivo Estandarizado */}
      <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Columna 1: Estado General y Acciones */}
        <div className="bg-surface-muted rounded-3xl p-6 shadow-sm border border-border/50 flex flex-col items-center gap-6 text-center">
          <div className="w-full flex flex-col items-center gap-3">
            <p className="text-text-primary font-heading font-bold text-md">
              Estado
            </p>
            <StatusSwitch checked={provision.isActive ?? true} disabled />
          </div>

          <div className="w-full flex flex-col gap-3">
            <p className="text-text-primary font-heading font-bold text-md">
              Acciones
            </p>
            <Button
              variant="tertiary"
              type="button"
              size="md"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => navigate(`/editInventory/${provision.id}`)}
            >
              <SquarePen className="w-5 h-5" />
              Editar Info
            </Button>
          </div>
        </div>

        {/* Columna 2, 3 y 4: Información Detallada */}
        <div className="lg:col-span-3 bg-surface-muted rounded-3xl p-6 shadow-sm border border-border/50 flex flex-col items-center gap-6">
          
          {/* Tarjeta Compacta del Suministro */}
          <div className="w-full max-w-xs bg-surface rounded-2xl p-4 flex flex-col items-center text-center shadow-md border border-border/30">
            {/* Avatar / Imagen Dinámica Compacta */}
            <div className="mb-2 flex items-center justify-center">
              {provision.image || provision.imageUrl ? (
                <img
                  src={provision.image || provision.imageUrl}
                  alt={provisionName}
                  className="w-14 h-14 object-cover shadow-md border-2 border-white/50"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#ec4899] text-white font-black text-xl flex items-center justify-center shadow-md uppercase select-none">
                  {getInitials(provisionName)}
                </div>
              )}
            </div>

            

            {/* Lote con alto contraste y visibilidad */}
            <p className="text-xs font-bold text-text-primary/90 tracking-wide uppercase mt-1">
              LOTE: <span className="font-extrabold text-black">{batchNumber}</span>
            </p>
          </div>

          {/* Formulario de Información (Inputs deshabilitados) */}
          <div className="w-full bg-surface rounded-2xl p-6 shadow-sm border border-border/40 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre del Suministro"
              value={provisionName}
              disabled
            />

            <Input
              label="Categoría"
              value={provision.category || ""}
              disabled
            />

            <Input
              label="Estado del Suministro"
              value={provision.status || "activo"}
              disabled
            />

            <Input
              label="Unidad de Medida"
              value={provision.unit || ""}
              disabled
            />

            <Input
              label="Stock Actual"
              value={provision.stock ?? 0}
              disabled
            />

            <Input
              label="Stock Mínimo"
              value={provision.minStock ?? 0}
              disabled
            />

            <Input
              label="Stock Máximo"
              value={provision.maxStock ?? 0}
              disabled
            />

            <Input
              label="Precio Unitario ($ COP)"
              value={
                provision.price
                  ? `$ ${Number(provision.price).toLocaleString("es-CO")}`
                  : "$ 0"
              }
              disabled
            />
          </div>
        </div>

      </div>
    </div>
  );
}

