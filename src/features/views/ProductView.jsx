import { useParams } from "react-router-dom";
import { Input, StatusSwitch } from "@/shared";
import { UtensilsCrossed } from "lucide-react";
import { menu } from "../menu/data/menu";

export default function ProductView() {
  const { id } = useParams();

  const product = menu.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="min-h-screen w-full flex flex-col">
        
        <div className="flex items-center gap-3 mt-10 ml-30">
          <UtensilsCrossed className="w-16 h-16 text-text-primary" />
          <h1 className="text-main font-heading font-bold text-text-primary">
            Producto del Menú
          </h1>
        </div>
        <p className="ml-30 mt-8 text-red-500">Producto no encontrado.</p>
      </div>
    );
  }

  const initial = product.productName.charAt(0).toUpperCase();

  const colors = [
    "#E57373", "#F06292", "#BA68C8", "#9575CD",
    "#7986CB", "#64B5F6", "#4DB6AC", "#81C784",
    "#FFD54F", "#FF8A65",
  ];
  const bgColor = colors[product.id % colors.length];

  return (
    <div className="min-h-screen w-full flex flex-col">
      

      <div className="flex items-center gap-3 mt-10 ml-30">
        <UtensilsCrossed className="w-16 h-16 text-text-primary" />
        <h1 className="text-main font-heading font-bold text-text-primary">
          Producto del Menú
        </h1>
      </div>

      <div className="flex flex-row">
        <div className="flex flex-col items-center gap-8 mx-auto mt-[110px] mb-40">
          <div
            style={{
              backgroundColor: bgColor,
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

          <div className="flex items-center gap-10">
            <span
              className="text-[var(--color-black)] font-[var(--font-weight-regular)] text-[var(--fs-lg)]"
              style={{
                fontFamily: "var(--main-font)",
              }}
            >
              Estado
            </span>
            <StatusSwitch size="lg" checked={product.isAvailable} disabled />
          </div>
        </div>

        <div className="flex flex-row items-center justify-start gap-20 mx-auto w-fit h-fit mt-[130px] mb-30">
          <div className="w-56 flex flex-col gap-8">
            <Input
              label="Nombre del Platillo"
              name="productName"
              type="text"
              value={product.productName}
              disabled
            />
            <Input
              label="Categoría"
              name="category"
              type="text"
              value={product.category}
              disabled
            />
          </div>

          <div className="w-90 flex flex-col gap-4 mt-[-130px]">
            <Input
              className="mt-50"
              label="Precio"
              name="price"
              type="text"
              value={`$ ${product.price.toLocaleString("es-CO")}`}
              disabled
            />
            <div className="relative w-full">
              <textarea
                name="description"
                value={product.description || ""}
                disabled
                rows={5}
                className="w-full rounded-md border border-gray-300 p-2 pt-6 text-sm resize-none bg-transparent cursor-default peer"
              />
              <label className="absolute top-2 left-2 text-xs text-gray-500 pointer-events-none">
                Descripción
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}