// Pagina Publica

import { products } from "@/features/products/data/products";
import Card from "../../../shared/components/Card";

export default function HomePage(){

    return (
        <section
            className="relative min-h-screen w-full flex items-center justify-center text-black"

            style={{
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="absolute inset-0 bg-white/60" />

            <div className="z-10 text-center">
                <h1 className="mb-6 text-h1 font-heading "> Mis Productos</h1>

                {/* 
                    Contenedor de las cards usando CSS Grid con Tailwind.

                    grid -> Activa el sistema de Layout Grid.
                    grid-8 -> Espacio Uniforme entre las cards.

                    Responsive:
                    sm -> Desde 640px se muestran 2 columnas
                    lg -> Desde 1024px se muestran 3 columnas
                    xl -> Desde 1280px se muestran 4 columnas

                    justify-items-center -> Centra cada card dentroo de su columna cuando el ancho de la card es fijo.
                */}

                <div 
                    className="
                    grid
                    gap-8
                    sm:grid-cols-2
                    lg:grid-cols-3
                    xl:grid-cols-4
                    justify-items-center"
                >
                {products.map((product) => (
                    <Card key={product.id} product={product} />
                ))}                
                </div>            
            </div>       
        </section>
    );
}