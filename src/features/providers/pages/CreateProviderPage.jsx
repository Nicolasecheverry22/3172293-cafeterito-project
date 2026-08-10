import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Plus } from "lucide-react";
import { Input, Select, Checkbox, Button, FileInput, StatusSwitch, FormNavbar} from "@/shared";
import { getDocumentTypes } from "@/services/selectService"; 
import { providerSchema } from "../schemas/providerSchema"; 

export default function CreateProviderPage() {
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [documentTypes, setDocumentTypes] = useState([]);

  const [formData, setFormData] = useState({
    providerDocumentType: "",
    providerDocumentNumber: "",
    providerName: "",
    isActive: true,
    providerEmail: "",
    providerEmailConfirm: "",
    providerAddress: "",
    providerPhone: "",
    productFood: false,
    productSupplies: false,
    productFruits: false,
    productOthers: false,
    images: [],
  });

  useEffect(() => {
    getDocumentTypes().then(setDocumentTypes).catch(() => setDocumentTypes([]));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.providerEmail !== formData.providerEmailConfirm) {
      setErrors((prev) => ({
        ...prev,
        providerEmailConfirm: "Los correos electrónicos no coinciden",
      }));
      return;
    }

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
    console.log("Proveedor guardado:", result.data);

    navigate(-1);
  };

  return (
    <div className="w-full min-h-screen bg-background-main pb-10">
      <FormNavbar />
      
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <Truck className="w-8 h-8 text-text-primary" />
        <h1 className="text-main font-heading font-bold text-text-primary">
          Registrar proveedor nuevo
        </h1>
      </div>

      <div className="bg-[#B3B3B3] rounded-3xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="space-y-4">
            <Select
              label="Tipo de documento"
              name="providerDocumentType"
              value={formData.providerDocumentType}
              options={documentTypes}
              onChange={handleChange}
              error={errors.providerDocumentType}
            />

            <Input
              label="Número de documento"
              name="providerDocumentNumber"
              type="text"
              value={formData.providerDocumentNumber}
              placeholder="Ingrese su documento"
              onChange={handleChange}
              error={errors.providerDocumentNumber}
            />

            <Input
              label="Nombre completo"
              name="providerName"
              type="text"
              value={formData.providerName}
              placeholder="Ingrese nombre del proveedor"
              onChange={handleChange}
              error={errors.providerName}
            />

            <div className="flex items-center gap-4 py-2">
              <span className="font-label text-text-primary text-small">Estado</span>
              <StatusSwitch
                checked={formData.isActive}
                onChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>

            <Input
              label="Correo electrónico"
              name="providerEmail"
              type="email"
              value={formData.providerEmail}
              placeholder="Ingrese correo"
              onChange={handleChange}
              error={errors.providerEmail}
            />

            <Input
              label="Confirmar correo electrónico"
              name="providerEmailConfirm"
              type="email"
              value={formData.providerEmailConfirm}
              placeholder="Confirme correo"
              onChange={handleChange}
              error={errors.providerEmailConfirm}
            />

            <div className="pt-2">
              <Button variant="primary" size="md" type="button">
                <span className="flex items-center gap-2">
                  Agregar correo <Plus className="w-4 h-4" />
                </span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-4">
            <div>
              <FileInput
                value={formData.images}
                onChange={(files) =>
                  setFormData((prev) => ({ ...prev, images: files }))
                }
                multiple={false}
              />
            </div>

            <div className="space-y-4">
              <Input
                label="Dirección"
                name="providerAddress"
                type="text"
                value={formData.providerAddress}
                placeholder="Ingrese dirección"
                onChange={handleChange}
                error={errors.providerAddress}
              />

              <Input
                label="Número telefónico"
                name="providerPhone"
                type="tel"
                value={formData.providerPhone}
                placeholder="Ingrese número"
                onChange={handleChange}
                error={errors.providerPhone}
              />

              <div className="pt-2">
                <Button variant="primary" size="md" type="button">
                  <span className="flex items-center gap-2">
                    Agregar Número Telefónico <Plus className="w-4 h-4" />
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between h-full">
            <div className="bg-[#8E8E8E] p-6 rounded-2xl text-text-inverse space-y-3 shadow-inner">
              <h3 className="font-heading text-subtitle mb-2">Producto que suministra:</h3>

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
                label="Frutas y/o Verduras"
                checked={formData.productFruits}
                onChange={handleChange}
              />

              <Checkbox
                name="productOthers"
                label="Otro:"
                checked={formData.productOthers}
                onChange={handleChange}
              />
            </div>

            <div className="flex gap-4 items-center justify-end mt-4">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
              <Button type="submit" variant="primary" size="md">
                Crear Proveedor
              </Button>
            </div>
          </div>

        </form>
      </div>
    </div>
    </div>
  );
}