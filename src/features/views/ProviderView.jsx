import { useNavigate,useParams } from "react-router-dom";
import { Input,Button,StatusSwitch} from "../../shared";
import {SquarePen,Ambulance,UserRoundSearch} from "lucide-react"
import { providers } from "../providers/data/providers";

export default function ProviderView() {
    const navigate = useNavigate();
    const { id } = useParams();

    const provider = providers.find((p) => p.id === Number(id));

    if (!provider) {
        return (
            <div className="min-h-screen w-full flex flex-col">
                 
                <div className="flex items-center gap-3 mt-10 ml-12">
                    <UserRoundSearch className="w-10 h-10 text-text-primary" />
                    <h1 className="text-main font-heading font-bold text-text-primary">
                        Visualizar Usuario
                    </h1>
                </div>
                <p className="ml-12 mt-8 text-red-500">Usuario no encontrado.</p>
            </div>
        );
    }

  const provider = providers.find((p) => String(p.id) === String(id));

  if (!provider) {
    return (
        <div className="min-h-screen w-full flex flex-col">

             
            {/* Con esto logro que todo lo que esta contenido por la caja principal donde se encuentra la imagen y la infromacion del usuario queden columnas "una aal fente de la otra" con flex felx row */}
            <div className="flex items-center gap-3 mt-10 ml-30">
                <Ambulance className="w-10 h-10 text-text-primary" />
                <h1 className="text-main font-heading font-bold text-text-primary">
                Visualizar Proveedor
                </h1>
            </div>
            <div className="flex flex-row ">

                <div className="bg-[var(--color-gray-200)] rounded-3xl p-8 shadow-sm mt-[-100px] mx-auto w-fit h-fit mb-40 mt-[110px]"
                >
                    {/* Avatar con inicial */}
                        <div className="bg-[var(--color-gray-200)] rounded-3xl p-8 shadow-sm mt-[-100px] mx-auto w-fit h-fit mb-40 mt-[110px]"
                            style={{
                                backgroundColor: bgColor,
                                marginTop:"50px",
                                width: "150px",
                                height: "150px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "64px",
                                fontWeight: "bold",
                                color: "#fff",
                                userSelect: "none",
                            }}
                        >
                            {initial}
                        </div>
    

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