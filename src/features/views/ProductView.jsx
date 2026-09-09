import { Navbar } from "../../shared";
import authBg from "@/assets/images/burguer.jpg";
import { Input,StatusSwitch} from "../../shared";
import {UtensilsCrossed} from "lucide-react"

export default function ProductView() {
    return (
        <div className="min-h-screen w-full flex flex-col">

            <Navbar/>
            {/* Con esto logro que todo lo que esta contenido por la caja principal donde se encuentra la imagen y la infromacion del usuario queden columnas "una aal fente de la otra" con flex felx row */}
            <div className="flex items-center gap-3 mt-10 ml-30">
                <UtensilsCrossed className="w-16 h-16 text-text-primary" />
                <h1 className="text-main font-heading font-bold text-text-primary">
                Producto del Menú 
                </h1>
            </div>
            <div className="flex flex-row ">

                <div className="mt-50 mx-auto w-fit h-fit mb-40 mt-[110px]"
                
                    style={{
                        backgroundImage: `url(${authBg})`,
                        backgroundPosition: "center center",
                        backgroundSize: "350px 350px",
                        backgroundRepeat: "no-repeat",
                        width: "350px",
                        
                        // height: "400px",
                    }}
                
                >
    

                    <div className="flex justify-center mt-100 mb-2">
                        
                        
                    </div>
                    <div  className="flex justify-center">

                    <div className="flex items-center gap-10">
                            <span className="text-[var(--color-black)] font-[var(--font-weight-regular)] text-[var(--fs-lg)]"
                            style={{
                                fontFamily: "var(--main-font)",
                            }}>
                                Estado
                            </span>
                            <StatusSwitch
                            size="lg"
                
                            />
                    </div>
                    </div>

                </div>

                <div className="flex flex-row items-center justify-start gap-20 mx-auto w-fit h-fit mt-[130px] mb-30">

                    <div className="w-56 flex flex-col gap-8 ">
                         <Input
                            
                            label="Nombre del Platillo"
                            name="nameProduct"
                            type="text"
                            value="Hamburguesa Triple Carne"
                            disabled
                        />
                        <Input
                            label="Categoria"
                            name="categoryInfo"
                            type="text"
                            value="Comidas Rapidas"
                            disabled
                        />
                    </div>

                    <div className="w-90 flex flex-col gap-4 mt-[-130px]">
                        <Input
                            className="mt-50"
                            label="Precio"
                            name="priceProduct"
                            type="number"
                            value="40.000"
                            disabled
                        />
                        <div className="relative w-full">
                        <textarea
                            name="productInfo"
                            value="Tres jugosas medallones de carne 100% de res seleccionada (120g c/u) asadas a la parrilla, con triple capa de queso cheddar fundido, crujiente tocino ahumado, pepinillos artesanales, cebolla caramelizada y nuestra salsa especial de la casa, todo dentro de un suave pan brioche artesanal ligeramente tostado con mantequilla."
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