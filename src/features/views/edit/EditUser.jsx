import { NavbarAdmin } from "../../../shared";
import authBg from "@/assets/images/calvitor.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDocumentTypes } from "@/services/selectService";
import { Input,Button,StatusSwitch,Select,FileInput} from "../../../shared";
import {PencilSparkles} from "lucide-react"


export default function EditUser() {
        const navigate = useNavigate();
        const [documentTypes, setDocumentTypes] = useState([]);
        const [errors, setErrors] = useState({});
    
          useEffect(() => {
        getDocumentTypes().then(setDocumentTypes);
       
      }, []);
    
    
    
      const [formData, setFormData] = useState({
        productImage: [],
        userName: "",
        documentTypes: "",
        userPhone: "",
        addressInfo: "",
        userEmail: "",
      });
    
    
    
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      };
    return (
        <div className="min-h-screen w-full flex flex-col">

            <NavbarAdmin />

                <div className="flex items-center gap-3 mt-10 ml-12">
                <PencilSparkles className="w-10 h-10 text-text-primary" />
                <h1 className="text-main font-heading font-bold text-text-primary">
                Editar Usuario
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

                    
            <FileInput
                                value={formData.productImage}
                                onChange={(files) =>
                                    setFormData((prev) => ({ ...prev, productImage: files }))
                                }
                                multiple={true}
                                />
                                {errors.productImage && (
                                <span className="text-error text-captimt-1">
                                    {errors.productImage}
                                </span>
                                )}

                    
                    <div className="flex flex-row items-end justify-start gap-60 bg-[var(--color-gray-300)] rounded-3xl p-8 shadow-sm mt-50 mx-auto w-fit mt-[30px]">

                        <div className="w-fit flex flex-col gap-8">
                            <h2>Tipo de Documento</h2>
                            <h2>Nombre Completo</h2>
                            <h2>Direccion</h2>
                            <h2>Telefono</h2>
                            <h2>Correo</h2>
                        </div>

                    <div className="w-80 flex flex-col gap-4">
                        <Select
                                label=""
                                name="userName"
                                value={formData.documentTypes}
                                onChange={handleChange}
                                placeholder="Seleccione una Opcion"
                                options={documentTypes}
                                error={errors.userName}
                            />
                        <Input
                            label=""
                            name="providerName"
                            type="text"
                            value={formData.providerName}
                            onChange={handleChange}
                            placeholder="Calvitor Cortez Castrillon "
                            error={errors.providerName}
                        />
                        
                      
                        <Input
                            label=""
                            name="addressInfo"
                            type="text"
                            value={formData.addressInfo}
                            onChange={handleChange}
                            placeholder="Mz6 CS8 La Graciela-Dosquebradas"
                            error={errors.addressInfo}
                        />
                         <Input
                            label=""
                            name="userPhone"
                            type="text"
                            value={formData.userPhone}
                            onChange={handleChange}
                            placeholder="+57 311 123 5678"
                            error={errors.userPhone}
                        />

                        <Input
                            label=""
                            name="userEmail"
                            type="text"
                            value={formData.userEmail}
                            onChange={handleChange}
                            placeholder="calvo.victor@email.com"
                            error={errors.userEmail}
                        />
                    </div>
                  
              
               </div>
               <div className="flex gap-100 items-center justify-end mt-4 mr-10">
                    <Button
                    variant="secondary"
                    size="md"
                    type="button"
                    onClick={() => navigate(-1)}
                    >
                    Cancelar
                    </Button>

                    <Button 
                    variant="primary" 
                    size="md" 
                    type="button"
                    onClick={() => navigate(-1)}>
                    Guardar
                    </Button>
                 </div>

                </div>
                </div>
                


            </div>
            

        </div>
    );
}