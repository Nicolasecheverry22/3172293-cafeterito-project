import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Input, StatusSwitch, Button, ImageThumb } from "@/shared";
import { UtensilsCrossed, SquarePen } from "lucide-react";
import { getProductById } from "@/services/productApi";

export default function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getProductById(id)
      .then((data) => setProduct(data))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="min-h-screen w-full flex flex-col">
        <div className="flex items-center gap-3 mt-10 ml-12">
          <UtensilsCrossed className="w-10 h-10 text-text-primary" />
          <h1 className="text-main font-heading font-bold text-text-primary">
            Visualizar Producto
          </h1>
        </div>
        <p className="ml-12 mt-8 text-error">Producto no encontrado.</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p className="text-text-secondary">Cargando producto...</p>
      </div>
    );
  }

  const productName = product.productName || "Platillo";

  return (
    <div className="bg-surface/40 dark:bg-surface/80 backdrop-blur-md rounded-shape-xl p-4 sm:p-6 md:p-8 border border-border/40 shadow-elevation-3">
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
        <div className="bg-surface-muted rounded-shape-xl p-4 sm:p-6 shadow-elevation-1 border border-border/50 flex flex-col items-center gap-6 text-center">
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
        <div className="lg:col-span-3 bg-surface-muted rounded-shape-xl p-4 sm:p-6 shadow-elevation-1 border border-border/50 flex flex-col items-center gap-6">
          
          {/* Tarjeta Compacta del Platillo */}
          <div className="w-full max-w-xs bg-surface rounded-shape-lg p-4 flex flex-col items-center text-center shadow-elevation-2 border border-border/30">
            {/* Imagen grande del platillo o placeholder (RFADMIN21) */}
            <div className="mb-3 flex items-center justify-center w-full">
              <ImageThumb
                src={product.productImage}
                alt={`Imagen de ${productName}`}
                icon={UtensilsCrossed}
                size="xl"
                className="shadow-elevation-2"
              />
            </div>

            <p className="text-xs font-bold text-text-primary/90 tracking-wide uppercase mt-1">
              id: <span className="font-extrabold text-text-primary">{product.id || "General"}</span>
            </p>
          </div>

          {/* Formulario de Información (Inputs deshabilitados) */}
          <div className="w-full bg-surface rounded-shape-lg p-4 sm:p-6 shadow-elevation-1 border border-border/40 grid grid-cols-1 md:grid-cols-2 gap-6">
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