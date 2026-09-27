import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FormNavbar } from "@/shared";
import authBg from "@/assets/images/burguer.jpg";
import { Input, StatusSwitch } from "@/shared";
import { UtensilsCrossed } from "lucide-react";

// Datos mock o fallback de ejemplo si no hay backend aún
const MOCK_PRODUCTS = [
  {
    id: "1",
    nameProduct: "Hamburguesa Triple Carne",
    categoryInfo: "Comidas Rápidas",
    priceProduct: "40000",
    productInfo:
      "Tres jugosos medallones de carne 100% de res seleccionada (120g c/u) asadas a la parrilla, con triple capa de queso cheddar fundido, crujiente tocino ahumado, pepinillos artesanales, cebolla caramelizada y nuestra salsa especial de la casa, todo dentro de un suave pan brioche artesanal ligeramente tostado con mantequilla.",
    isActive: true,
    image: authBg,
  },
];

export default function ProductView() {
  const { id } = useParams(); // Lee el parametro :id desde la URL
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Aquí puedes hacer un fetch/AXIOS a tu backend:
    // const fetchProduct = async () => { ... }
    
    // Por ahora, buscamos el producto en datos estáticos de prueba:
    const foundProduct = MOCK_PRODUCTS.find((item) => String(item.id) === String(id));

    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      // Fallback por defecto si se accede directamente con un ID no mapeado
      setProduct({
        nameProduct: "Hamburguesa Triple Carne",
        categoryInfo: "Comidas Rápidas",
        priceProduct: "40000",
        productInfo:
          "Tres jugosos medallones de carne 100% de res seleccionada (120g c/u) asadas a la parrilla, con triple capa de queso cheddar fundido, crujiente tocino ahumado, pepinillos artesanales, cebolla caramelizada y nuestra salsa especial de la casa, todo dentro de un suave pan brioche artesanal ligeramente tostado con mantequilla.",
        isActive: true,
        image: authBg,
      });
    }
  }, [id]);

  if (!product) return null;

  return (
    <div className="min-h-screen w-full flex flex-col">
      <FormNavbar />

      <div className="flex items-center gap-3 mt-10 ml-30">
        <UtensilsCrossed className="w-16 h-16 text-text-primary" />
        <h1 className="text-main font-heading font-bold text-text-primary">
          Producto del Menú
        </h1>
      </div>

      <div className="flex flex-row">
        {/* Sección de Imagen y Estado */}
        <div
          className="mt-50 mx-auto w-fit h-fit mb-40 mt-[110px]"
          style={{
            backgroundImage: `url(${product.image || authBg})`,
            backgroundPosition: "center center",
            backgroundSize: "350px 350px",
            backgroundRepeat: "no-repeat",
            width: "350px",
          }}
        >
          <div className="flex justify-center mt-100 mb-2"></div>
          <div className="flex justify-center">
            <div className="flex items-center gap-10">
              <span
                className="text-[var(--color-black)] font-[var(--font-weight-regular)] text-[var(--fs-lg)]"
                style={{
                  fontFamily: "var(--main-font)",
                }}
              >
                Estado
              </span>
              <StatusSwitch size="lg" checked={product.isActive} disabled />
            </div>
          </div>
        </div>

        {/* Sección de Detalle e Información */}
        <div className="flex flex-row items-center justify-start gap-20 mx-auto w-fit h-fit mt-[130px] mb-30">
          <div className="w-56 flex flex-col gap-8">
            <Input
              label="Nombre del Platillo"
              name="nameProduct"
              type="text"
              value={product.nameProduct || ""}
              disabled
            />
            <Input
              label="Categoría"
              name="categoryInfo"
              type="text"
              value={product.categoryInfo || ""}
              disabled
            />
          </div>

          <div className="w-90 flex flex-col gap-4 mt-[-130px]">
            <Input
              className="mt-50"
              label="Precio"
              name="priceProduct"
              type="text"
              value={
                product.priceProduct
                  ? `$ ${Number(product.priceProduct).toLocaleString("es-CO")}`
                  : ""
              }
              disabled
            />
            <div className="relative w-full">
              <textarea
                name="productInfo"
                value={product.productInfo || ""}
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