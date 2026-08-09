import { Navbar } from "../../shared";
import authBg from "@/assets/images/provider.png";
import { useNavigate } from "react-router-dom";
import { Input,Button,StatusSwitch} from "../../shared";
import {SquarePen,Ambulance} from "lucide-react"

export default function ProviderView() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen w-full flex flex-col">

            <Navbar/>
            {/* Con esto logro que todo lo que esta contenido por la caja principal donde se encuentra la imagen y la infromacion del usuario queden columnas "una aal fente de la otra" con flex felx row */}
            <div className="flex items-center gap-3 mt-10 ml-30">
                <Ambulance className="w-10 h-10 text-text-primary" />
                <h1 className="text-main font-heading font-bold text-text-primary">
                Visualizar Proveedor
                </h1>
            </div>
            <div className="flex flex-row ">

                <div className="bg-[var(--color-gray-200)] rounded-3xl p-8 shadow-sm mt-50 mx-auto w-fit h-fit mb-40 mt-[110px]"
                
                    style={{
                        backgroundImage: `url(${authBg})`,
                        backgroundPosition: "center center",
                        backgroundSize: "300px 300px",
                        backgroundRepeat: "no-repeat",
                        width: "350px",
                        
                        // height: "400px",
                    }}
                
                >
    

                    <div className="flex justify-center mt-100 mb-2">
                        <Button
                            variant="secondary"
                            type="button"
                            size="md"
                            onClick={() => navigate("/EditProvider")}
                
                        >
                            <SquarePen className="w-5 h-5 gap-1"/>
                            Editar Info
                        </Button>
                        
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

                <div className="flex flex-row items-end justify-start gap-20 bg-[var(--color-gray-200)] rounded-3xl p-8 shadow-sm mt-70 mx-auto w-fit h-fit mt-[130px] mb-30">

                    <div className="w-fit flex flex-col gap-8 ">
                        <h2>Nit</h2>
                        <h2>Nombre Proveedor</h2>
                        <h2>Direccion</h2>
                        <h2>Telefono</h2>
                        <h2>Correo</h2>
                    </div>

                    <div className="w-80 flex flex-col gap-4">
                        <Input
                            label=""
                            name="documentNumberInfo"
                            type="text"
                            value="902447851-4"
                            disabled
                        />
                        <Input
                            label=""
                            name="nameInfo"
                            type="text"
                            value="Meat Point"
                            disabled
                        />
                        <Input
                            label=""
                            name="addressInfo"
                            type="text"
                            value="Cr15 #18b Bogotá"
                            disabled
                        />
                        <Input
                            label=""
                            name="phoneInfo"
                            type="text"
                            value="+57 311 123 5678"
                            disabled
                        />
                        <Input
                            label=""
                            name="emailInfo"
                            type="email"
                            value="meat.point@email.com"
                            disabled
                        />
                    </div>
                   
                

                </div>
                

            </div>
            <div className="bg-[var(--color-gray-200)] rounded-3xl p-8 shadow-sm mt-70 mx-auto w-fit mt-[-340px] mr-70">

                    <div className="w-fit flex items-center flex-col gap-4">

                        <h1
                            className="text-[var(--color-black)] font-[var(--font-weight-bold)] text-[var(--fs-lg)]"
                            style={{
                                fontFamily: "var(--main-font)",
                            }}
                        >
                            Productos que Suministra
                            <br />
                        </h1>

                        <Input
                            label=""
                            type="text"
                            value="Productos Carnicos"
                            disabled
                        />
                    
                    </div>

                </div>

        </div>
    );
}