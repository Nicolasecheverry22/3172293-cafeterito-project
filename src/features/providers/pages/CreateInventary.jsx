import { useEffect, useState } from "react";
import authBg from "@/assets/images/bg-1.png";
import { getCategoryTypes } from "@/services/selectService";
import { Input, Button, Select } from "@/shared";
import {
    FileInput
} from "@/shared";

export default function CreateInventary(){

    const [categoryTypes, setCategoryTypes] = useState([])

    useEffect(() => {
        getCategoryTypes().then(setCategoryTypes);
    },[])
    
    
    // Estado del error
    const [ errors, setErrors] = useState({})

    const [formData, setFormData] = useState({
        userName: "",
        userEmail: "",
        userPhone: "",
        userDocumentTypes: "",
        userDocumentNumber: "",
        userPassword: "",
        userImage: [],

        //Flags booleanos
        isStaff: false,
        isActive: true,
        isSuperUser: false,
    });

    return(
        <>
        <div
          className="min-h-screen w-full mx-auto justify-center"
          style={{
            backgroundImage: `url(${authBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}  
        >
            <main className="min-h-screen flex items-center justify-start px-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 w-full shadow-xl">
                    
                    <h1 className="text-center text-title font-bold mb-8">
                        Crear Inventario
                    </h1>

                    
                    <div className="grid gap-4">

                        <div className="grid grid-cols-3 gap-6 items-start">

                            <div>
                                 <FileInput
                                    value={formData.userImage}
                                    onChange={(files) =>
                                        setFormData((prev)  => ({...prev, userImage: files}))
                                    }
                                    multiple={true}
                                    />
                                    {errors.userImage && (
                                        <span className= "text-red-500 text-sm">{errors.userImage}</span>
                                    )}
                            </div>

                            <div className="flex flex-col gap-4">
                                <Input
                                    label="Nombre del Producto"
                                    type="text"
                                    placeholder="Escribe el nombre del producto"
                                    htmlFor="name-product"
                                />
                                <Input
                                    label="Descripcion"
                                    type="text"
                                    placeholder="Escribe la descripcion del producto"
                                    htmlFor="product-description"
                                />
                                <Select
                                    label="Categoria de alimentos"
                                    name="userAlimentTypes"
                                    placeholder="Seleccione una Categoria"
                                    htmlFor="userAlimentTypes"
                                    options={categoryTypes}
                                />
                            </div>

                            {/* Columna derecha */}
                            <div className="flex flex-col gap-4">
                                <Input
                                    label="Codigo del Producto"
                                    type="number"
                                    placeholder="Escribe el codigo del producto"
                                    htmlFor="product-number"
                                />
                                <Input
                                    label="Precio"
                                    name="foodPrice"
                                    placeholder="Ingrese precio del producto"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                />
                                <Input
                                    label="Marca"
                                    name="foodBrand"
                                    type="text"
                                    placeholder="Ej: Alpina"
                                />
                                <Input
                                    label="Cantidad"
                                    name="foodQuantity"
                                    type="number"
                                    min="0"
                                    step="1"
                                    placeholder="Ej: 10"
                                />
                            </div>

                        </div>

                        {/* Botones */}
                        <div className="flex gap-6 items-center mt-4 justify-center">
                            <Button variant="secondary" size="sm" type="button">
                                Cancelar
                            </Button>
                            <Button variant="primary" size="md" type="submit">
                                Guardar
                            </Button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
        </>
    );
}