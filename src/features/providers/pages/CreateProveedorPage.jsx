import { useState } from "react";
import {
  Input,
  Select,
  Checkbox,
  Button,
} from "@/shared"; 
import { useNavigate } from "react-router-dom";
import { providerSchema } from "../schemas/providerSchema"; 
import documentTypesData from "@/data/selects/documentTypes.json";

export default function CreateProveedorPage() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    providerDocumentType: "",
    providerDocumentNumber: "",
    providerName: "",
    isActive: true, 
    providerEmail: "",
    providerEmailConfirm: "",
    providerImage: "",
    providerAddress: "",
    providerPhone: "",
    productFood: false,
    productSupplies: false,
    productFruits: false,
    productService: false,
    productOthers: false,
    providerProductServiceDesc: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = providerSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    

    try {
      // const response = await createProvider(formData);
      
      alert("Proveedor creado correctamente");
      navigate(-1);
    } catch (error) {
      console.error("Error:", error.message);
      alert(error.message);
    }
  };


  return (
<div className="w-full">
      <h2 className="text-main font-heading text-text-primary mb-8">
        Registrar proveedor nuevo
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-surface-muted border border-border p-8 rounded-lg">
        
        <div className="flex flex-col gap-4">
          <Select
            label="Tipo de documento"
            name="providerDocumentType"
            value={formData.providerDocumentType}
            options={documentTypesData}
            onChange={handleChange}
            error={errors.providerDocumentType}
          />
          <Input
            label="Número de documento"
            name="providerDocumentNumber"
            type="text"
            value={formData.providerDocumentNumber}
            onChange={handleChange}
            error={errors.providerDocumentNumber}
          />
          <Input
            label="Nombre completo"
            name="providerName"
            type="text"
            value={formData.providerName}
            onChange={handleChange}
            error={errors.providerName}
          />
          <Input
            label="Correo electrónico"
            name="providerEmail"
            type="email"
            value={formData.providerEmail}
            onChange={handleChange}
            error={errors.providerEmail}
          />
          <Input
            label="Confirmar correo electrónico"
            name="providerEmailConfirm"
            type="email"
            value={formData.providerEmailConfirm}
            onChange={handleChange}
            error={errors.providerEmailConfirm}
          />

<div className="self-center mt-2">
            <Button variant="secondary" type="button" size="sm">
              Agregar correo 
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Dirección"
            name="providerAddress"
            type="text"
            value={formData.providerAddress}
            onChange={handleChange}
            error={errors.providerAddress}
          />
          <Input
            label="Número telefónico"
            name="providerPhone"
            type="tel"
            value={formData.providerPhone}
            onChange={handleChange}
            error={errors.providerPhone}
          />

          <div className="self-center mt-2">
            <Button variant="secondary" type="submit" size="sm">
              Agregar Número Telefónico 
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">  
      
          <div className="flex flex-col gap-2 bg-white/50 p-4 rounded border border-gray-200">

            <h3 className="flex flex-col">Producto que suministra:
            </h3>  
            
            <Checkbox
              name="productFood"
              label="Alimentos y/o Bebidas"
              checked={formData.productFood}
              onChange={handleChange}
            />
            <Checkbox
              name="productSupplies"
              label="Insumos"
              checked={formData.productSupplies}
              onChange={handleChange}
            />
            <Checkbox
              name="productFruits"
              label="Frutas y Verduras"
              checked={formData.productFruits}
              onChange={handleChange}
            />
            <Checkbox
              name="productService"
              label="Servicio"
              checked={formData.productService}
              onChange={handleChange}
            />
            <Checkbox
              name="productOthers"
              label="Otros"
              checked={formData.productOthers}
              onChange={handleChange}
            />
            
            <Input
            placeholder="Producto/Servicio"
            name="providerProductServiceDesc"
            type="text"
            value={formData.providerProductServiceDesc}
            onChange={handleChange}
            error={errors.providerProductServiceDesc}
          />
          </div>



          <div className="mt-auto flex justify-end">
            <Button variant="primary" type="submit" size="md">
              Crear Usuario
            </Button>
          </div>
        </div>

      </form>
    </div>
  );
}