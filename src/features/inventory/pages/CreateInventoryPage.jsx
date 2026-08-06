import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategoryTypes } from "@/services/selectService";
import { Input, Button, Select, FileInput, FormNavbar} from "@/shared";

export default function CreateInventoryPage() {
  const navigate = useNavigate();
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [errors, setErrors] = useState({});


  useEffect(() => {
    getCategoryTypes().then(setCategoryTypes);
  }, []);



  const [formData, setFormData] = useState({
    productImage: [],
    productName: "",
    productDescription: "",
    productCategory: "",
    productCode: "",
    foodPrice: "",
    foodBrand: "",
    foodQuantity: "",
  });



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Inventario guardado:", formData);
    alert("Producto de inventario creado correctamente");
    navigate(-1);
  };



  return (
        <div className="w-full min-h-screen bg-background-main pb-10">
      <FormNavbar />
    <div className="w-full max-w-6xl mx-auto p-4">
      <h1 className="text-main font-heading text-text-primary mb-8 font-bold">
        Crear Producto
      </h1>

      <div className="bg-surface-muted border border-border p-8 rounded-2xl shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            <div className="flex flex-col items-center">
              <FileInput
                value={formData.productImage}
                onChange={(files) =>
                  setFormData((prev) => ({ ...prev, productImage: files }))
                }
                multiple={true}
              />
              {errors.productImage && (
                <span className="text-error text-caption mt-1">
                 {errors.productImage}
                </span>
              )}
           </div>


            <div className="flex flex-col gap-4">
              <Input
                label="Nombre del Producto"
                name="productName"
                type="text"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Escribe el nombre del producto"
                error={errors.productName}
              />

              <Input
               label="Descripción"
                name="productDescription"
                type="text"
                value={formData.productDescription}
                onChange={handleChange}
                placeholder="Escribe la descripción del producto"
                error={errors.productDescription}

              />

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


            <div className="flex flex-col gap-4">
              <Input
                label="Código del Producto"
                name="productCode"
                type="text"
                value={formData.productCode}
                onChange={handleChange}
                placeholder="Escribe el código del producto"
                error={errors.productCode}
              />

              <Input
                label="Precio"
                name="foodPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.foodPrice}
                onChange={handleChange}
                placeholder="Ingrese precio del producto"
                error={errors.foodPrice}
              />

              <Input
                label="Marca"
                name="foodBrand"
                type="text"
                value={formData.foodBrand}
                onChange={handleChange}
                placeholder="Ej: Alpina"
                error={errors.foodBrand}
              />

              <Input
                label="Cantidad"
                name="foodQuantity"
                type="number"
                min="0"
                step="1"
                value={formData.foodQuantity}
                onChange={handleChange}
                placeholder="Ej: 10"
                error={errors.foodQuantity}
              />

            </div>

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

            <Button variant="primary" size="md" type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );

} 

