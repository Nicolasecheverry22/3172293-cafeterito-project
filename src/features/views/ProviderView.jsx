import { Navbar } from "../../shared";
import authBg from "@/assets/images/provider.png";
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
                <Navbar />
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

    const initial = provider.providerName.charAt(0).toUpperCase();

    // Damos una lista de posibles colores y se le asigna segun el id del usuario
    const colors = [
        "#E57373", "#F06292", "#BA68C8", "#9575CD",
        "#7986CB", "#64B5F6", "#4DB6AC", "#81C784",
        "#FFD54F", "#FF8A65",
    ];
    const bgColor = colors[provider.id % colors.length];

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
    

                    <div className="flex justify-center mt-[-100px] mb-2">
                        <Button
                            variant="secondary"
                            type="button"
                            size="md"
                            onClick={() => navigate(`/EditProvider/${provider.id}`)}
                
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
                            value={provider.nit}
                            disabled
                        />
                        <Input
                            label=""
                            name="nameInfo"
                            type="text"
                            value={provider.providerName}
                            disabled
                        />
                        <Input
                            label=""
                            name="addressInfo"
                            type="text"
                            value={provider.providerAddress}
                            disabled
                        />
                        <Input
                            label=""
                            name="phoneInfo"
                            type="text"
                            value={provider.providerPhone}
                            disabled
                        />
                        <Input
                            label=""
                            name="emailInfo"
                            type="email"
                            value={provider.providerEmail}
                            disabled
                        />
                    </div>
                   
                

                </div>
                

            </div>
            <div className="bg-[var(--color-gray-200)] rounded-3xl p-8 shadow-sm mt-70 mx-auto w-fit mt-[-200px] mr-70">

                    <div className="w-90 flex items-center flex-col gap-4 mr-1 ">

                        <h1
                            className="text-[var(--color-black)] font-[var(--font-weight-bold)] text-[var(--fs-lg)]"
                            style={{
                                fontFamily: "var(--main-font)",
                            }}
                        >
                            Productos que Suministra
                            <br />
                        </h1>

                        <Input className="w-20"
                            label=""
                            type="text"
                            value={provider.productService}
                            disabled
                        />
                    
                    </div>

                </div>

        </div>
    );
}