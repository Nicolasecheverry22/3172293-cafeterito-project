import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { FormNavbar, Input, Button, StatusSwitch, Select } from "@/shared";
import { Pencil } from "lucide-react";
import { inventory as inventoryData } from "../../inventory/data/inventory";
import { createEditProductSchema } from "../../inventory/schemas/editProductSchema";
import { getCategoryTypes } from "@/services/selectService";
import {
    showSuccessAlert,
    showSystemErrorAlert,
    showDeleteCancelAlert,
} from "@/shared/services/alertService";

const DEFAULT_CATEGORIES = [
  { value: "Carnes", label: "Carnes" },
  { value: "Verduras", label: "Verduras" },
  { value: "Tubérculos", label: "Tubérculos" },
  { value: "Granos", label: "Granos" },
  { value: "Lácteos", label: "Lácteos" },
  { value: "Insumos", label: "Insumos" },
  { value: "Panadería", label: "Panadería" },
  { value: "Bebidas", label: "Bebidas" },
  { value: "Salsas", label: "Salsas" },
];

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categoriesOptions, setCategoriesOptions] = useState(DEFAULT_CATEGORIES);
  const [errors, setErrors] = useState({});

  const item = inventoryData.find((p) => String(p.id) === String(id));

  useEffect(() => {
    if (getCategoryTypes) {
      getCategoryTypes()
        .then((res) => {
          if (Array.isArray(res) && res.length > 0) {
            setCategoriesOptions(res);
          }
        })
        .catch(() => setCategoriesOptions(DEFAULT_CATEGORIES));
    }
  }, []);

  useEffect(() => {
    if (!item) {
      showSystemErrorAlert({
        text: "El producto que intentas editar no existe.",
      }).then(() => navigate("/inventoryList", { replace: true }));
    }
  }, [item, navigate]);

  const [formData, setFormData] = useState({
    productName: item?.productName ?? item?.nameProduct ?? "",
    category: "",
    stock: item?.stock ?? 0,
    unit: item?.unit ?? "",
    price: item?.price ?? item?.priceProduct ?? 0,
    isActive: item?.isActive ?? item?.is_active ?? true,
  });

  if (!item) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const schema = createEditProductSchema({ currentProductId: item.id });
    const result = schema.safeParse(formData);

    if (!result.success) {
      console.log("Errores de validación:", result.error.flatten().fieldErrors);
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    try {
      Object.assign(item, {
        ...result.data,
        stock: Number(result.data.stock),
        price: Number(result.data.price),
      });

      await showSuccessAlert({
        title: "¡Producto actualizado!",
        text: "Los cambios fueron guardados correctamente.",
      });

      navigate("/inventoryList");
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
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
      navigate("/inventoryList");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background pb-12">
      

      {/* Encabezado */}
      <div className="max-w-7xl w-full mx-auto px-6 mt-8 mb-6 flex items-center gap-3">
        <Pencil className="w-9 h-9 text-text-primary" />
        <h1 className="text-main font-heading font-bold text-text-primary text-2xl">
          Editar Producto
        </h1>
      </div>

      {/* Formulario Principal */}
      <form onSubmit={handleSave} className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Columna Izquierda: Estado */}
        <div className="bg-surface-muted rounded-3xl p-6 shadow-sm border border-border/50 flex flex-col items-center gap-4 text-center">
          <p className="text-text-primary font-heading font-bold text-lg">Estado</p>
          <StatusSwitch
            size="lg"
            checked={formData.isActive}
            onChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
          />
        </div>

        {/* Columna Derecha: Campos de Entrada */}
        <div className="lg:col-span-3 bg-surface-muted rounded-3xl p-8 shadow-sm border border-border/50 flex flex-col gap-8">
          
          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border/40 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre del Producto"
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
              onChange={handleChange}
              placeholder="Seleccione una categoría"
              options={categoriesOptions}
              error={errors.category}
            />
            <Input
              label="Stock Disponible"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              error={errors.stock}
            />
            <Input
              label="Unidad de Medida"
              name="unit"
              type="text"
              value={formData.unit}
              onChange={handleChange}
              error={errors.unit}
            />
            <div className="md:col-span-2">
              <Input
                label="Precio Unitario ($ COP)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                error={errors.price}
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-4 items-center justify-end border-t border-border/40 pt-6">
            <Button variant="secondary" size="md" type="button" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" type="submit">
              Guardar Cambios
            </Button>
          </div>

        </div>
      </form>
    </div>
  );
}