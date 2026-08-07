import { useNavigate } from "react-router-dom";
import { Truck, UtensilsCrossed, Package } from "lucide-react";
import Navbar from "@/shared/layouts/Navbar";
import Button from "@/shared/components/Button";

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full flex flex-col bg-background">
            <Navbar />
            
            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-10 p-6">
                
                {/* Acciones Rápidas */}
                <div className="bg-surface p-6 rounded-3xl shadow-sm border border-border">

                    <h2 className="text-title font-heading font-bold mb-4 text-text-primary">
                        Accesos rápidos
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => navigate("/ordensList")}
                            className="w-full justify-start p-2 h-auto rounded-2xl shadow-sm border border-border hover:border-brand transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-4 p-3 bg-brand-soft rounded-xl w-full">
                                <UtensilsCrossed className="w-6 h-6 text-text-primary shrink-0" />
                                <span className="font-heading font-semibold text-text-primary">Nuevo Pedido</span>
                            </div>
                        </Button>

                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => navigate("/providerCreate")}
                            className="w-full justify-start p-2 h-auto rounded-2xl shadow-sm border border-border hover:border-brand transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-4 p-3 bg-brand-soft rounded-xl w-full">
                                <Truck className="w-6 h-6 text-text-primary shrink-0" />
                                <span className="font-heading font-semibold text-text-primary">Registrar Proveedor</span>
                            </div>
                        </Button>

                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => navigate("/inventoryCreate")}
                            className="w-full justify-start p-2 h-auto rounded-2xl shadow-sm border border-border hover:border-brand transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-4 p-3 bg-brand-soft rounded-xl w-full">
                                <Package className="w-6 h-6 text-text-primary shrink-0" />
                                <span className="font-heading font-semibold text-text-primary">Nuevo Producto</span>
                            </div>
                        </Button>

                    </div>
                </div>

            </div>
        </div>
    );
}