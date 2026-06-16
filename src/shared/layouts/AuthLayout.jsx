import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import authBg from "@/assets/images/bg-1.png";
import { getDocumentTypes } from "../../services/selectService";

import { 
    Input, 
    Button, 
    DeleteCounter2, 
    Select, 
    // Checkbox 
} from "@/shared";

export default function AuthLayout(){

    // Estado para los tipos de documentos
    const [documentTypes, setDocumentTypes] = useState([])

    // Uso del estado useEffect
    useEffect(() => {
        getDocumentTypes().then(setDocumentTypes);
    },[])

    return(
        <>
        <div
          className= "min-h-screen w-full mx-auto"
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
            placeholder= "Escribe tu nombre"
            htmlFor="name"
            variant="secundary"
            size= "md"
            />
            
            <Input
            label="Correo"
            type="email"
            placeholder= "Escribe tu correo"
            htmlFor="user-email"
            />
      
            <Input
            label="Telefono"
            type="tel"
            placeholder= "Escribe tu numero de telefono"
            htmlFor="user-phone"
            />

            <Input
            label="Borrar Tipo de documento"
            type="tel"
            placeholder= "Escribe tu numero de telefono"
            htmlFor=""
            />

            <Input
            label="Documento"
            type="text"
            placeholder= "Escribe tu numero de documento"
            htmlFor="user-document-number"
            />

            {/* Actions */}

            <div className="flex gap-6 items-center">
                <Button 
                    variant= "secondary"
                    size="sm"
                    type="button"
                >
                    Cancelar
                    
                </Button>
                <Button  
                    variant= "primary"
                    size="md"
                    type="submit"
                >
                    Guardar
                    
                </Button>
            </div>
            <div className="mt-10">
                <h1>Ejemplo useState</h1>
                <DeleteCounter2></DeleteCounter2>
            </div>
            {/* Impplementacion de UseEffect */}
            <div className="mt-12">
                <h1>Este es mi useEffect</h1>
                {/* <EffectDemo></EffectDemo> */}
            </div>
                {/* <CounterEffect/> */}

                <Select
                    label="Tipos de documento"
                    name="userDocumentTypes"
                    htmlFor="userDocumentTypes"
                    options={documentTypes}
                />

                {/* <Checkbox
                    id="isStaff"
                    name="isStaff"
                    label="Es staff"
                    checked={formData.isStaff}
                    onChange={handleChange}
                />
                <Checkbox
                    id="isActive"
                    name="isActive"
                    label="Es staff"
                    checked={formData.isActive}
                    onChange={handleChange}
                /> */}
                    
            <Outlet/>
        </main>    
     </div>
 </>
    );
}