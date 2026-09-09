import { Navbar } from "../../../shared";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDocumentTypes } from "@/services/selectService";
import { getCategoryTypes } from "@/services/selectService";
import { Input, Button, StatusSwitch,FileInput,Select} from "../../../shared";
import { PencilSparkles } from "lucide-react";
import { providers } from "../../providers/data/providers";

export default function EditProvider() {
    const navigate = useNavigate();
    const { id } = useParams();

    const provider = providers.find((p) => p.id === Number(id));

    const [documentTypes, setDocumentTypes] = useState([]);
    const [categoryTypes, setCategoryTypes] = useState([]);
    const [errors, setErrors] = useState({});

      useEffect(() => {
    getDocumentTypes().then(setDocumentTypes);
    getCategoryTypes().then(setCategoryTypes);

  }, []);



  const [formData, setFormData] = useState({
    productImage: [],
    providerName: "",
    productDescription: "",
    documentTypes: "",
    providerPhone: "",
    providerDirection: "",
    providerEmail: "",
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

            <Navbar/>
           
            <div className="flex items-center gap-3 mt-10 ml-30">
                <PencilSparkles className="w-10 h-10 text-text-primary" />
                <h1 className="text-main font-heading font-bold text-text-primary">
                Editar Proveedor
                </h1>
            </div>
            <div className="flex flex-row ">

                <div className="bg-[var(--color-gray-200)] rounded-3xl p-8 shadow-sm mt-50 mx-auto w-fit h-70 mb-40 mt-[150px]">

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
                
                    <div className="flex items-center gap-10 mt-6 ml-6">
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

                <div className="flex flex-row items-end justify-start gap-20 bg-[var(--color-gray-200)] rounded-3xl p-8 shadow-sm mt-70 mx-auto w-fit h-fit mt-[130px] mb-30">

                    <div className="w-fit flex flex-col gap-8 ">
                        <h2>Tipo de Documento</h2>
                        <h2>Nombre Proveedor</h2>
                        <h2>Direccion</h2>
                        <h2>Telefono</h2>
                        <h2>Correo</h2>
                    </div>

                    <div className="w-80 flex flex-col gap-4">
                        <Select
                                label=""
                                name="productCategory"
                                value={formData.documentTypes}
                                onChange={handleChange}
                                placeholder="Seleccione una Opcion"
                                options={documentTypes}
                                error={errors.productCategory}
                            />
                        <Input
                            label=""
                            name="providerName"
                            type="text"
                            value={formData.providerName}
                            onChange={handleChange}
                            placeholder={provider.providerName}
                            error={errors.providerName}
                        />
                        
                      
                        <Input
                            label=""
                            name="providerDirection"
                            type="text"
                            value={formData.providerDirection}
                            onChange={handleChange}
                            placeholder={provider.providerAddress}
                            error={errors.providerDirection}
                        />
                         <Input
                            label=""
                            name="providerPhone"
                            type="text"
                            value={formData.providerPhone}
                            onChange={handleChange}
                            placeholder={provider.providerPhone}
                            error={errors.providerPhone}
                        />

                        <Input
                            label=""
                            name="providerEmail"
                            type="text"
                            value={formData.providerEmail}
                            onChange={handleChange}
                            placeholder={provider.providerEmail}
                            error={errors.providerEmail}
                        />
                    </div>
                   
                

                </div>
                

            </div>
            <div className="bg-[var(--color-gray-200)] rounded-3xl p-8 shadow-sm mt-10 mr-70 w-fit ml-220 mt-[-100px] mb-50">

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

                    <Select
                        label="Categoría de alimentos"
                        name="productCategory"
                        value={formData.productCategory}
                        onChange={handleChange}
                        placeholder="Seleccione una Categoría"
                        options={categoryTypes}
                        error={errors.productCategory}
                    />
                
                </div>
            
            </div>
                <div className="flex gap-100 items-center justify-end mt-4 mr-120">
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
    );
}