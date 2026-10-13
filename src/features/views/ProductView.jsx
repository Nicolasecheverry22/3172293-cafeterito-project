import { useParams, useNavigate } from "react-router-dom";
import { Input, StatusSwitch, Button } from "@/shared";
import { UtensilsCrossed, SquarePen } from "lucide-react";
import { menu } from "../menu/data/menu";

export default function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = menu.find((p) => String(p.id) === String(id));

  if (!product) {
    return (
      <div className="min-h-screen w-full flex flex-col">
        <div className="flex items-center gap-3 mt-10 ml-12">
          <UtensilsCrossed className="w-10 h-10 text-text-primary" />
          <h1 className="text-main font-heading font-bold text-text-primary">
            Visualizar Producto
          </h1>
        </div>
        <p className="ml-12 mt-8 text-red-500">Producto no encontrado.</p>
      </div>
    );
  }

  const productName = product.productName || "Platillo";

  // Iniciales dinámicas para el avatar en caso de no tener imagen
  const getInitials = (name) => {
    if (!name) return "P";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const colors = [
    "#E57373", "#F06292", "#BA68C8", "#9575CD",
    "#7986CB", "#64B5F6", "#4DB6AC", "#81C784",
    "#FFD54F", "#FF8A65",
  ];
  const bgColor = colors[product.id % colors.length];

  return (
    <div className="bg-surface/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-border/40 shadow-2xl">
      {/* Encabezado Principal */}
      <div className="max-w-7xl w-full mx-auto px-6 mt-8 mb-6 flex items-center gap-3">
        <UtensilsCrossed className="w-9 h-9 text-text-primary" />
        <h1 className="text-main font-heading font-bold text-text-primary text-2xl">
          Visualizar Producto del Menú
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
            <StatusSwitch checked={product.isAvailable ?? true} disabled />
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
              onClick={() => navigate(`/EditProduct/${product.id}`)}
            >
              <SquarePen className="w-5 h-5" />
              Editar Info
            </Button>
          </div>
        </div>

        {/* Columna 2, 3 y 4: Información Detallada */}
        <div className="lg:col-span-3 bg-surface-muted rounded-3xl p-6 shadow-sm border border-border/50 flex flex-col items-center gap-6">
          
          {/* Tarjeta Compacta del Platillo */}
          <div className="w-full max-w-xs bg-surface rounded-2xl p-4 flex flex-col items-center text-center shadow-md border border-border/30">
            <div className="mb-2 flex items-center justify-center">
              {product.productImage && product.productImage.length > 0 ? (
                <img
                  src={product.productImage[0]}
                  alt={productName}
                  className="w-14 h-14 object-cover rounded-full shadow-md border-2 border-white/50"
                />
              ) : (
                <div
                  style={{ backgroundColor: bgColor }}
                  className="w-14 h-14 rounded-full text-white font-black text-xl flex items-center justify-center shadow-md uppercase select-none"
                >
                  {getInitials(productName)}
                </div>
              )}
            </div>

            <p className="text-xs font-bold text-text-primary/90 tracking-wide uppercase mt-1">
              id: <span className="font-extrabold text-black">{product.id || "General"}</span>
            </p>
          </div>

          {/* Formulario de Información (Inputs deshabilitados) */}
          <div className="w-full bg-surface rounded-2xl p-6 shadow-sm border border-border/40 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre del Platillo"
              value={productName}
              disabled
            />

            <Input
              label="Categoría"
              value={product.category || ""}
              disabled
            />

            <Input
              label="Precio ($ COP)"
              value={
                product.price
                  ? `$ ${Number(product.price).toLocaleString("es-CO")}`
                  : "$ 0"
              }
              disabled
            />

            <Input
              label="Estado de Disponibilidad"
              value={product.isAvailable ? "Disponible" : "No disponible"}
              disabled
            />

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-text-primary/80 block mb-1">
                Descripción
              </label>
              <textarea
                value={product.description || "Sin descripción"}
                disabled
                rows={3}
                className="w-full rounded-md border border-border/40 p-2 text-sm bg-surface-muted cursor-default resize-none"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}