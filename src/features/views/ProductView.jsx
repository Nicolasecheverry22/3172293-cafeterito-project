import { FormNavbar, Input, Button, StatusSwitch } from "@/shared";
import { useNavigate, useParams } from "react-router-dom";
import { Package, SquarePen, ArrowLeft, Boxes } from "lucide-react";
import { inventory as inventoryData } from "../inventory/data/inventory"

export default function ProductView() {
  const navigate = useNavigate();
  const { id } = useParams();

  const item = inventoryData.find((p) => String(p.id) === String(id));

  if (!item) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-background">
        <div className="max-w-4xl mx-auto mt-12 p-8 bg-surface-muted rounded-3xl shadow-sm border border-border text-center">
          <Package className="w-12 h-12 text-error mx-auto mb-4" />
          <h1 className="text-main font-heading font-bold text-text-primary mb-2">
            Producto no encontrado
          </h1>
          <p className="text-text-secondary mb-6">
            El insumo o producto solicitado no existe en el inventario.
          </p>
          <Button variant="secondary" onClick={() => navigate("/inventory")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver al inventario
          </Button>
        </div>
      </div>
    );
  }

  // Normalización de datos con fallbacks
  const productName = item.productName ?? item.nameProduct ?? item.name ?? "";
  const category = item.category ?? item.categoryInfo ?? "Sin Categoría";
  const stock = item.stock ?? 0;
  const unit = item.unit ?? "unidades";
  const price = item.price ?? item.priceProduct ?? 0;
  const isActive = item.isActive ?? item.is_active ?? true;

  // Formato de moneda COP
  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);

  return (
    <div className="min-h-screen w-full flex flex-col bg-background pb-12">
      

      {/* Encabezado Principal */}
      <div className="max-w-7xl w-full mx-auto px-6 mt-8 mb-6 flex items-center gap-3">
        <Package className="w-9 h-9 text-text-primary" />
        <h1 className="text-main font-heading font-bold text-text-primary text-2xl">
          Visualizar Producto
        </h1>
      </div>

      {/* Grid Responsivo de 4 Columnas */}
      <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Columna Izquierda: Estado */}
        <div className="bg-surface-muted rounded-3xl p-6 shadow-sm border border-border/50 flex flex-col items-center gap-4 text-center">
          <p className="text-text-primary font-heading font-bold text-lg">
            Estado
          </p>
          <StatusSwitch size="lg" checked={Boolean(isActive)} disabled />
        </div>

        {/* Columna Central (2 columnas): Información del Producto y Tarjeta de Existencias */}
        <div className="lg:col-span-2 bg-surface-muted rounded-3xl p-8 shadow-sm border border-border/50 flex flex-col items-center gap-8">
          
          {/* Tarjeta Visual de Stock Disponible */}
          <div className="p-6 bg-surface rounded-2xl border border-border/40 w-full flex flex-col items-center gap-2 text-center shadow-xs">
            <Boxes className="w-12 h-12 text-text-primary" />
            <span className="text-caption font-semibold text-text-secondary uppercase tracking-wider">
              Stock Disponible
            </span>
            <div className="text-4xl font-heading font-bold text-text-primary mt-1">
              {stock}{" "}
              <span className="text-base font-normal text-text-secondary">
                {unit}
              </span>
            </div>
          </div>

          {/* Formulario de Campos de Lectura */}
          <div className="bg-surface rounded-2xl p-6 shadow-sm w-full border border-border/40 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre del Producto"
              name="productName"
              type="text"
              value={productName}
              disabled
            />
            <Input
              label="Categoría"
              name="category"
              type="text"
              value={category}
              disabled
            />
            <Input
              label="Existencias"
              name="stock"
              type="text"
              value={`${stock} ${unit}`}
              disabled
            />
            <Input
              label="Unidad de Medida"
              name="unit"
              type="text"
              value={unit}
              disabled
            />
            <div className="md:col-span-2">
              <Input
                label="Precio Unitario"
                name="price"
                type="text"
                value={formattedPrice}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Acciones */}
        <div className="bg-surface-muted rounded-3xl p-6 shadow-sm border border-border/50 flex flex-col items-center gap-4 text-center">
          <p className="text-text-primary font-heading font-bold text-lg">
            Acciones
          </p>
          <Button
            variant="secondary"
            type="button"
            size="md"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => navigate(`/EditProduct/${item.id}`)}
          >
            <SquarePen className="w-5 h-5" />
            Editar Producto
          </Button>
        </div>

      </div>
    </div>
  );
}