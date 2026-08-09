import { NavbarAdmin } from "../../shared";
import authBg from "@/assets/images/calvitor.png";
import { useNavigate } from "react-router-dom";
import { Input,Button,StatusSwitch} from "../../shared";
import {SquarePen,UserRoundSearch} from "lucide-react"


export default function UserView() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full flex flex-col">

            <NavbarAdmin />

                <div className="flex items-center gap-3 mt-10 ml-12">
                <UserRoundSearch className="w-10 h-10 text-text-primary" />
                <h1 className="text-main font-heading font-bold text-text-primary">
                Visualizar Usuario
                </h1>
            </div>
            <div className="flex flex-row ">

                <div className="bg-[var(--color-gray-200)] rounded-3xl p-8 shadow-sm mt-50 mx-auto w-fit h-fit mt-100 mr-20 ml-20">


                <div className="flex justify-center">
                    <div className="flex flex-col items-center gap-4 w-fit">
                    <p className="text-[var(--color-black)] font-[var(--font-weight-bold)] text-[var(--fs-lg)]">
                        Estado
                    </p>
                        <StatusSwitch size="lg" />
                    </div>
                </div>

            </div>
            <div className="flex flex-row gap-50 bg-[var(--color-gray-600)] rounded-3xl p-8 shadow-sm mt-50 mx-auto w-fit h-fit mt-[80px] mb-20">

                <div className="flex items-center flex-col gap-8 flex-1">

                    
                    <div
                        style={{
                            backgroundImage: `url(${authBg})`,
                            backgroundPosition: "center center",
                            backgroundSize: "300px 300px",
                            backgroundRepeat: "no-repeat",
                            width: "350px",
                            height: "300px",
                        }}
                    />

                    
                    <div className="flex flex-row items-end justify-start gap-60 bg-[var(--color-gray-300)] rounded-3xl p-8 shadow-sm mt-50 mx-auto w-fit mt-[30px]">

                        <div className="w-fit flex flex-col gap-8">
                            <h2>Nombre</h2>
                            <h2>Cedula de Ciudadania</h2>
                            <h2>Direccion</h2>
                            <h2>Telefono</h2>
                            <h2>Correo</h2>
                        </div>

                    <div className="w-80 flex flex-col gap-4">
                        <Input
                            label=""
                            name="nameInfo"
                            type="text"
                            value="Calvitor Cortez Castrillon"
                            disabled
                        />
                        <Input
                            label=""
                            name="documentNumberInfo"
                            type="text"
                            value="9024478511"
                            disabled
                        />
                        <Input
                            label=""
                            name="addressInfo"
                            type="text"
                            value="Mz6 CS8 La Graciela-Dosquebradas"
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
                            value="calvo.victor@email.com"
                            disabled
                        />
                    </div>
                   
                

                </div>

                </div>
                </div>
                <div className="bg-[var(--color-gray-200)] rounded-3xl p-8 shadow-sm mt-100 mx-auto w-fit h-fit mr-20 ml-20">

                <div className="flex flex-col items-center gap-4 w-fit">
                    <p className="text-[var(--color-black)] font-[var(--font-weight-bold)] text-[var(--fs-lg)]">
                        Editar Perfil
                    </p>

                    <Button
                        variant="secondary"
                        type="button"
                        size="md"
                        onClick={() => navigate("/EditUser")}
                    >
                        <SquarePen className="w-5 h-5 gap-1"/>
                        Editar 
                    </Button>
                </div>



                </div>


            </div>

        </div>
    );
}