// Pagina Publica
import { products } from "@/features/products/data/products";
import Navbar from "../../../shared/layouts/Navbar";
import authBg from "../../../assets/images/bg-3.jpg";
import Card from "../../../shared/components/Card";

export default function HomePage() {
    return (
        <div className="min-h-screen w-full flex flex-col">
            <Navbar />

            <section
                className="relative min-h-screen w-full flex items-center justify-center text-black"
                style={{
                    backgroundImage: `url(${authBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {/* Overlay (ajusta opacidad si quieres más contraste) */}
                <div className="absolute inset-0 bg-white/30" />

                <div className="z-10 text-center px-4">
                    <h1 className="mb-6 text-h1 font-heading">
                        Mis Productos
                    </h1>

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
        </div>
    );
}