import { useState } from "react";
import {
  Input,
  Select,
  Button,
} from "@/shared";

import { useNavigate } from "react-router-dom";


export default function InventoryCreatePage() {

  const navigate = useNavigate();

  const [errors, setErrors] = useState({});


  const [formData, setFormData] = useState({

    productName: "",
    category: "",
    stock: "",
    unit: "",
    price: "",

  });



  const categories = [
    {
      value: "Carnes",
      label: "Carnes",
    },
    {
      value: "Verduras",
      label: "Verduras",
    },
    {
      value: "Tubérculos",
      label: "Tubérculos",
    },
    {
      value: "Granos",
      label: "Granos",
    },
    {
      value: "Lácteos",
      label: "Lácteos",
    },
    {
      value: "Insumos",
      label: "Insumos",
    },
    {
      value: "Panadería",
      label: "Panadería",
    },
    {
      value: "Bebidas",
      label: "Bebidas",
    },
    {
      value: "Salsas",
      label: "Salsas",
    },
  ];



  const units = [
    {
      value: "kg",
      label: "Kilogramos",
    },
    {
      value: "litros",
      label: "Litros",
    },
    {
      value: "unidades",
      label: "Unidades",
    },
  ];



  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };



  const handleSubmit = async (e) => {

    e.preventDefault();


    const newErrors = {};


    if (!formData.productName.trim()) {
      newErrors.productName = "El nombre del producto es obligatorio";
    }


    if (!formData.category) {
      newErrors.category = "Seleccione una categoría";
    }


    if (!formData.stock || formData.stock <= 0) {
      newErrors.stock = "Ingrese una cantidad válida";
    }


    if (!formData.unit) {
      newErrors.unit = "Seleccione una unidad";
    }


    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Ingrese un precio válido";
    }



    if (Object.keys(newErrors).length > 0) {

      setErrors(newErrors);
      return;

    }



    setErrors({});


    try {


      const product = {
        ...formData,
        stock: Number(formData.stock),
        price: Number(formData.price),
      };


      // Aquí iría la petición al backend
      console.log("Producto creado:", product);


      alert("Producto creado correctamente");


      navigate(-1);


    } catch(error) {

      console.error(error);
      alert("Error creando producto");

    }

  };



  return (

    <div className="w-full max-w-4xl mx-auto p-4">


      <h2 className="text-main font-heading font-bold text-text-primary mb-8">

        Registrar producto nuevo

      </h2>



      <form

        onSubmit={handleSubmit}

        className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface-muted border border-border p-8 rounded-2xl shadow-sm"

      >


        <div className="flex flex-col gap-4">


          <Input

            label="Nombre del producto"

            name="productName"

            type="text"

            value={formData.productName}

            onChange={handleChange}

            error={errors.productName}

          />



          <Select

            label="Categoría"

            name="category"

            value={formData.category}

            options={categories}

            onChange={handleChange}

            error={errors.category}

          />



          <Select

            label="Unidad de medida"

            name="unit"

            value={formData.unit}

            options={units}

            onChange={handleChange}

            error={errors.unit}

          />


        </div>





        <div className="flex flex-col gap-4">


          <Input

            label="Cantidad disponible"

            name="stock"

            type="number"

            value={formData.stock}

            onChange={handleChange}

            error={errors.stock}

          />



          <Input

            label="Precio unitario"

            name="price"

            type="number"

            value={formData.price}

            onChange={handleChange}

            error={errors.price}

          />



          <div className="mt-auto flex justify-end gap-4">


            <Button

              variant="secondary"

              type="button"

              size="md"

              onClick={() => navigate(-1)}

            >

              Cancelar

            </Button>



            <Button

              variant="primary"

              type="submit"

              size="md"

            >

              Crear producto

            </Button>


          </div>


        </div>



      </form>


    </div>

  );

}