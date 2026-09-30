import { useNavigate, useParams } from "react-router-dom";
import { FormNavbar, Input, Button, StatusSwitch } from "@/shared";
import { SquarePen, Ambulance, ArrowLeft, Building2 } from "lucide-react";
import { providers } from "../providers/data/providers";

export default function ProviderView() {
  const navigate = useNavigate();
  const { id } = useParams();

  const provider = providers.find((p) => String(p.id) === String(id));

  if (!provider) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-background">
        
        <div className="max-w-4xl mx-auto mt-12 p-8 bg-surface-muted rounded-3xl shadow-sm border border-border text-center">
          <Building2 className="w-12 h-12 text-error mx-auto mb-4" />
          <h1 className="text-main font-heading font-bold text-text-primary mb-2">
            Proveedor no encontrado
          </h1>
          <p className="text-text-secondary mb-6">
            El proveedor solicitado no se encuentra registrado en el sistema.
          </p>
          <Button variant="secondary" onClick={() => navigate("/providerList")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver a proveedores
          </Button>
        </div>
      </div>
    );
  }

  const initial = provider.providerName
    ? provider.providerName.charAt(0).toUpperCase()
    : "P";

  // Colores consistentes para la inicial del avatar
  const colors = [
    "#E57373", "#F06292", "#BA68C8", "#9575CD",
    "#7986CB", "#64B5F6", "#4DB6AC", "#81C784",
    "#FFD54F", "#FF8A65",
  ];
  const bgColor = colors[(provider.id || 0) % colors.length];

  return (
    <div className="min-h-screen w-full flex flex-col bg-background pb-12">
    

      {/* Encabezado Principal */}
      <div className="max-w-7xl w-full mx-auto px-6 mt-8 mb-6 flex items-center gap-3">
        <Ambulance className="w-9 h-9 text-text-primary" />
        <h1 className="text-main font-heading font-bold text-text-primary text-2xl">
          Visualizar Proveedor
        </h1>
      </div>

      {/* Grid Responsivo Estandarizado (4 columnas) */}
      <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Columna 1: Avatar e Identificación */}
        <div className="bg-surface-muted rounded-3xl p-6 shadow-sm border border-border/50 flex flex-col items-center gap-4 text-center">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-md border-2 border-white/20 select-none"
            style={{ backgroundColor: bgColor }}
          >
            {initial}
          </div>
          <div>
            <h2 className="font-heading font-bold text-text-primary text-lg">
              {provider.providerName}
            </h2>
            <p className="text-caption text-text-secondary">
              NIT: {provider.nit}
            </p>
          </div>
        </div>

        {/* Columna 2 y 3 (Central): Información General del Proveedor */}
        <div className="lg:col-span-2 bg-surface-muted rounded-3xl p-8 shadow-sm border border-border/50 flex flex-col gap-6">
          <h2 className="text-lg font-heading font-bold text-text-primary border-b border-border/40 pb-2">
            Información de Contacto
          </h2>

          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border/40 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="NIT / Documento"
              name="nit"
              type="text"
              value={provider.nit || ""}
              disabled
            />
            <Input
              label="Nombre del Proveedor"
              name="providerName"
              type="text"
              value={provider.providerName || ""}
              disabled
            />
            <Input
              label="Dirección"
              name="providerAddress"
              type="text"
              value={provider.providerAddress || ""}
              disabled
            />
            <Input
              label="Teléfono"
              name="providerPhone"
              type="text"
              value={provider.providerPhone || ""}
              disabled
            />
            <div className="md:col-span-2">
              <Input
                label="Correo Electrónico"
                name="providerEmail"
                type="email"
                value={provider.providerEmail || ""}
                disabled
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Productos / Servicios Suministrados"
                name="productService"
                type="text"
                value={provider.productService || "No especificado"}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Columna 4: Estado y Acciones */}
        <div className="bg-surface-muted rounded-3xl p-6 shadow-sm border border-border/50 flex flex-col items-center gap-6 text-center">
          <div className="w-full flex flex-col items-center gap-2">
            <p className="text-text-primary font-heading font-bold text-lg">
              Estado
            </p>
            <StatusSwitch
              size="lg"
              checked={Boolean(provider.isActive)}
              disabled
            />
          </div>

          <div className="w-full pt-4 border-t border-border/40 flex flex-col gap-3">
            <p className="text-text-primary font-heading font-bold text-md">
              Acciones
            </p>
            <Button
              variant="secondary"
              type="button"
              size="md"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => navigate(`/editProvider/${provider.id}`)}
            >
              <SquarePen className="w-5 h-5" />
              Editar Info
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}