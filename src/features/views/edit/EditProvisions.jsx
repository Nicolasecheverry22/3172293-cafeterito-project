import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Input, Button, StatusSwitch, FileInput, Select } from "@/shared";
import { UtensilsCrossed } from "lucide-react";
import provisionsCategoryTypes from "../../../data/selects/provisionsCategoryTypes.json";
import { inventory } from "../../inventory/data/inventory";
import {
  showSystemErrorAlert,
  showDeleteCancelAlert,
} from "@/shared/services/alertService";

export default function ProvisionsView() {
  const navigate = useNavigate();
  const { id } = useParams();

  const product = inventory.find((p) => p.id === Number(id));

  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    price: "",
    stock: "",
    productImage: [],
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      console.log(formData);

      await Swal.fire({
        title: "¡Suministro actualizado!",
        text: "Los cambios fueron guardados correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "rounded-2xl",
          title: "text-green-600",
          confirmButton: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 cursor-pointer rounded-lg",
          timerProgressBar: "!bg-green-600",
        },
        buttonsStyling: false,
      });

      navigate(-1);
    } catch (error) {
      console.error("Error al actualizar el suministro:", error);
      await showSystemErrorAlert({
        text: "Los cambios no pudieron guardarse.",
      });
    }
  };

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: "¿Descartar cambios?",
      text: "Los cambios realizados no se guardarán.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, descartar",
      cancelButtonText: "Continuar editando",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl",
        title: "!text-amber-600 font-bold",
        confirmButton:
          "!bg-red-600 hover:!bg-red-700 text-white cursor-pointer px-4 py-2 rounded-lg ml-2 font-medium",
        cancelButton:
          "!bg-gray-500 hover:!bg-gray-600 text-white cursor-pointer px-4 py-2 rounded-lg font-medium",
      },
      buttonsStyling: false,
    });

    if (result.isConfirmed) {
      showDeleteCancelAlert({
        title: "Edición cancelada",
        text: "No se guardaron los cambios.",
      });
      navigate(-1);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen w-full flex flex-col">
        
        <div className="flex items-center gap-3 mt-10 ml-30">
          <UtensilsCrossed className="w-16 h-16 text-text-primary" />
          <h1 className="text-main font-heading font-bold text-text-primary">
            Suministros 
          </h1>
        </div>
        <p className="ml-30 mt-8 text-red-500">Producto no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      

      <div className="flex items-center gap-3 mt-10 ml-30">
        <UtensilsCrossed className="w-16 h-16 text-text-primary" />
        <h1 className="text-main font-heading font-bold text-text-primary">
          Suministros de Inventario
        </h1>
      </div>

      <form onSubmit={handleSave}>
        <div className="flex flex-row">
          <div className="flex flex-col items-center gap-8 mx-auto mt-[110px] mb-40">
            <div className="bg-surface-muted rounded-3xl p-8 shadow-sm w-fit h-fit">
              <FileInput
                value={formData.productImage}
                onChange={(files) => setFormData((prev) => ({ ...prev, productImage: files }))}
                multiple={true}
              />
              {errors.productImage && (
                <span className="text-error text-caption mt-1">{errors.productImage}</span>
              )}
            </div>

            <div className="flex items-center gap-10">
              <span
                className="text-[var(--color-black)] font-[var(--font-weight-regular)] text-[var(--fs-lg)]"
                style={{
                  fontFamily: "var(--main-font)",
                }}
              >
                Estado
              </span>
              <StatusSwitch size="lg" checked={product.isAvailable} disabled />
            </div>
          </div>

          <div className="flex flex-row items-center justify-start gap-20 mx-auto w-fit h-fit mt-[130px] mb-30">
            <div className="w-56 flex flex-col gap-8">
              <Input
                label="Nombre Suministro"
                name="productName"
                type="text"
                value={formData.productName}
                placeholder={product.productName}
                onChange={handleChange}
              />
              <Select
                label="Categoría"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder={product.category}
                options={provisionsCategoryTypes}
                error={errors.category}
              />
            </div>

            <div className="w-90 flex flex-col gap-4 mt-[-130px]">
              <Input
                className="mt-36"
                label="Precio"
                name="price"
                type="text"
                value={formData.price}
                placeholder={`$ ${product.price.toLocaleString("es-CO")}`}
                onChange={handleChange}
              />
            <div className="w-90 flex flex-col gap-4 mt-[-130px]">
              <Input
                className="mt-36"
                label="Stock"
                name="stock"
                type="text"
                value={formData.stock}
                placeholder={String(product.stock)}
                onChange={handleChange}
              />
              
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6 items-center justify-end mr-20 mb-10">
          <Button variant="secondary" size="md" type="button" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button variant="primary" size="md" type="submit">
            Guardar
          </Button>
        </div>
      </form>
      </div>
  );
}