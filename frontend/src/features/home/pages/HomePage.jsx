import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared";
import { UtensilsCrossed, Truck, Package } from "lucide-react";
import Card from "@/shared/components/Card";

export default function Home() {
  const navigate = useNavigate();
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopSelling() {
      try {
        const response = await fetch("http://localhost:4000/api/products/top-selling");
        if (!response.ok) {
          throw new Error("Error al obtener los platillos más vendidos");
        }
        const data = await response.json();
        setTopProducts(data);
      } catch (error) {
        console.error("Error al cargar platillos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopSelling();
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Accesos rápidos */}
      <div className="flex flex-col gap-10">
        <div className="bg-surface/40 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-border">
          <h2 className="text-title font-heading font-bold mb-4 text-text-primary">
            Accesos rápidos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/ordensCreate")}
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

      {/* Platillos más vendidos */}
      <div className="rounded-xl bg-surface/40 backdrop-blur-md p-6 shadow-lg border border-border">
        <h2 className="text-title font-heading font-bold mb-4 text-text-primary">Platillos más vendidos</h2>

        {loading ? (
          <p className="text-text-secondary">Cargando platillos...</p>
        ) : topProducts.length === 0 ? (
          <p className="text-text-secondary">No hay platillos disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {topProducts.map((product) => (
              <Card key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}