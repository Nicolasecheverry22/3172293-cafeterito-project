import { Outlet } from "react-router-dom";
import authBg from "@/assets/images/bg-1.png";
import Input from "../components/Input";
import Button from "../components/Button";

export default function AuthLayout(){
    return(
        <>
            <div
                className= "min-h-screen w-full"
                style ={{
                    backgroundImage: `url(${authBg})`,
                    backgroundSize : "cover",
                    backgroundPosition: "center",
                }}  
            >
            <main className="mx-auto">
                <Input
                    label="Nombre"
                    type="text"
                    placeholder="Escribe tu nombre"
                    htmlFor="user-name"
                    variant="primary"
                    size="md"
                />
                <Input
                    label="Correo"
                    type="email"
                    placeholder="Escribe tu correo"
                    htmlFor="user-email"
                    variant="primary"
                    size="md"

                />
                <Input
                    label="Teléfono"
                    type="tel"
                    placeholder="Escribe tu número de teléfono"
                    htmlFor="user-phone"
                    variant="primary"
                    size="md"
                />
                <Input
                    label="Tipo de documento"
                    type="text"
                    placeholder="Escribe tu nombre"
                    htmlFor="name"
                    variant="primary"
                    size="md"
                />
                <Input
                    label="Número de documento"
                    type="text"
                    placeholder="Escribe tu número de documento"
                    htmlFor="user-document-number"
                    variant="primary"
                    size="md"
                />

                    {/* {Actions} */}
                <div className="flex gap-6 items-center">
                    <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        onClick={() => console.log("Se oprimio el boton")}
                    
                    >Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        type="submit"
                        onClick={() => console.log("Se oprimio el boton")}
                    
                    >Guardar
                    </Button>
                </div>



                <h1>Hola que tal</h1>
                <Outlet/>
            </main>   
            </div>
        </>
    );

}