import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Input, Button, StatusSwitch, ImageThumb } from "@/shared";
import { SquarePen, UtensilsCrossed, Package } from "lucide-react";
import { getInventoryItem } from "@/services/inventoryApi";

export default function ProvisionsView() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [provision, setProvision] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getInventoryItem(id)
      .then((data) => setProvision(data))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="min-h-screen w-full flex flex-col">
        <div className="flex items-center gap-3 mt-10 ml-12">
          <UtensilsCrossed className="w-10 h-10 text-text-primary" />
          <h1 className="text-main font-heading font-bold text-text-primary">
            Visualizar Suministro
          </h1>
        </div>
        <p className="ml-12 mt-8 text-error">Suministro no encontrado.</p>
      </div>
    );
  }

  if (!provision) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p className="text-text-secondary">Cargando suministro...</p>
      </div>
    );
  }

  const provisionName = provision.provisionName || "Suministro";

  // Lote real del suministro (antes mostraba "LOT-101A" fijo si venía vacío)
  const batchNumber = provision.batch || "Sin lote";

  // La tabla inventory no tiene is_active: el estado vive en la columna status
  const isActive = provision.status === "Activo";

  return (
    <div className="bg-surface/40 dark:bg-surface/80 backdrop-blur-md rounded-shape-xl p-4 sm:p-6 md:p-8 border border-border/40 shadow-elevation-3">
      {/* Encabezado Principal */}
      <div className="max-w-7xl w-full mx-auto px-0 sm:px-6 mt-8 mb-6 flex items-center gap-3">
        <UtensilsCrossed className="w-9 h-9 text-text-primary" />
        <h1 className="text-main font-heading font-bold text-text-primary text-2xl">
          Visualizar Suministro de Inventario
        </h1>
      </div>

      {/* Grid Responsivo Estandarizado */}
      <div className="max-w-7xl w-full mx-auto px-0 sm:px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Columna 1: Estado General y Acciones */}
        <div className="bg-surface-muted rounded-shape-xl p-4 sm:p-6 shadow-elevation-1 border border-border/50 flex flex-col items-center gap-6 text-center">
          <div className="w-full flex flex-col items-center gap-3">
            <p className="text-text-primary font-heading font-bold text-md">
              Estado
            </p>
            <StatusSwitch checked={isActive} disabled />
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
        <div className="lg:col-span-3 bg-surface-muted rounded-shape-xl p-4 sm:p-6 shadow-elevation-1 border border-border/50 flex flex-col items-center gap-6">
          
          {/* Tarjeta Compacta del Suministro */}
          <div className="w-full max-w-xs bg-surface rounded-shape-lg p-4 flex flex-col items-center text-center shadow-elevation-2 border border-border/30">
            {/* Imagen del insumo o placeholder (RFADMIN21) */}
            <div className="mb-3 flex items-center justify-center w-full">
              <ImageThumb
                src={provision.provisionImage}
                alt={`Imagen de ${provisionName}`}
                icon={Package}
                size="xl"
                className="shadow-elevation-2"
              />
            </div>


            {/* Lote con alto contraste y visibilidad */}
            <p className="text-xs font-bold text-text-primary/90 tracking-wide uppercase mt-1">
              LOTE: <span className="font-extrabold text-text-primary">{batchNumber}</span>
            </p>
          </div>

          {/* Formulario de Información (Inputs deshabilitados) */}
          <div className="w-full bg-surface rounded-shape-lg p-4 sm:p-6 shadow-elevation-1 border border-border/40 grid grid-cols-1 md:grid-cols-2 gap-6">
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
              value={provision.status || "Sin estado"}
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

