import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import { Input, Button, StatusSwitch, Select, FileInput } from "@/shared";
import { inventory as inventoryData } from "../../inventory/data/inventory";
import { createEditProvisionsSchema } from "../../inventory/schemas/editProvisionsSchema";
import { getCategoryTypes } from "@/services/selectService";
import {
  showSystemErrorAlert,
  showDeleteCancelAlert,
  showSuccessAlert,
  showConfirmDeleteAlert,
  showCreateErrorAlert
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

const UNIT_OPTIONS = [
  { value: "kg", label: "Kilogramos (kg)" },
  { value: "g", label: "Gramos (g)" },
  { value: "lt", label: "Litros (lt)" },
  { value: "ml", label: "Mililitros (ml)" },
  { value: "unid", label: "Unidades (unid)" },
  { value: "lb", label: "Libras (lb)" },
];

const STATUS_OPTIONS = [
  { value: "Activo", label: "Activo" },
  { value: "Vencido", label: "Vencido" },
  { value: "Agotado", label: "Agotado" },
  { value: "Averia", label: "Avería" },
];

export default function EditProvisions() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categoriesOptions, setCategoriesOptions] = useState(DEFAULT_CATEGORIES);
  const [errors, setErrors] = useState({});

  // Búsqueda del suministro por id o provisionId
  const item = inventoryData.find(
    (p) => String(p.id) === String(id) || String(p.provisionId) === String(id)
  );

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
        text: "El suministro que intentas editar no existe.",
      }).then(() => navigate("/inventoryList", { replace: true }));
    }
  }, [item, navigate]);

  const [formData, setFormData] = useState({
    provisionName: item?.provisionName ?? item?.nameProvision ?? item?.name ?? "",
    category: item?.category ?? "",
    status: item?.status ?? item?.provisionStatus ?? "Activo",
    unit: item?.unit ?? "",
    batch: item?.batch ?? item?.provisionCode ?? "",
    stock: item?.stock ?? item?.quantity ?? "",
    minStock: item?.minStock ?? "",
    maxStock: item?.maxStock ?? "",
    price: item?.price ?? item?.priceProvision ?? item?.foodPrice ?? "",
    isActive: item?.isActive ?? item?.is_active ?? true,
    provisionImage: item?.provisionImage ?? item?.image ?? [],
  });

  if (!item) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  

  const handleSave = async (e) => {
    e.preventDefault();

    const currentId = item.id ?? item.provisionId;
    const schema = createEditProvisionsSchema({ currentProvisionId: currentId });
    const result = schema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);

      await showCreateErrorAlert({
        entity: "suministro",
        text: "Por favor revisa los errores indicados en el formulario antes de guardar.",
      });
      return;
    }

    setErrors({});

    try {
      
      Object.assign(item, {
        ...result.data,
        provisionName: result.data.provisionName,
        price: Number(result.data.price),
        priceProvision: Number(result.data.price),
        stock: Number(result.data.stock),
        minStock: Number(result.data.minStock),
        maxStock: Number(result.data.maxStock),
        batch: result.data.batch,
        provisionCode: result.data.batch,
        status: formData.status,             
        provisionStatus: formData.status,    
        isActive: formData.isActive,
        is_active: formData.isActive,
      });

      await showSuccessAlert({
        title: "¡Suministro actualizado!",
        text: "Los cambios fueron guardados correctamente.",
      });

      navigate("/inventoryList");
    } catch (error) {
      console.error("Error al actualizar el suministro:", error);
      await showSystemErrorAlert({
        text: "Los cambios no pudieron guardarse.",
      });
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    const oldStatus = formData.status;

    if (newStatus === oldStatus) return;

    const result = await showConfirmDeleteAlert({
      title: "¿Cambiar estado?",
      text: `¿Estás seguro de cambiar el estado de "${oldStatus}" a "${newStatus}"?`,
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      setFormData((prev) => ({
        ...prev,
        status: newStatus,
        provisionStatus: newStatus,
        isActive: newStatus.toLowerCase() === "activo" || newStatus.toLowerCase() === "disponible",
      }));
    }
  };

  const handleCancel = async () => {
    const result = await showConfirmDeleteAlert({
      title: "¿Descartar cambios?",
      text: "Los cambios realizados no se guardarán.",
      confirmButtonText: "Sí, descartar",
      cancelButtonText: "Continuar editando",
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
    <div className="bg-surface/70 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-border/40 shadow-2xl">
      <div className="max-w-7xl w-full mx-auto px-4 mb-6 flex items-center gap-3">
        <Pencil className="w-8 h-8 text-text-primary" />
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Editar suministro
        </h1>
      </div>

      <form onSubmit={handleSave} className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA 1 */}
        <div className="space-y-4">
          <Input
            label="Nombre del suministro"
            name="provisionName"
            type="text"
            value={formData.provisionName}
            placeholder="Ingrese el nombre"
            onChange={handleChange}
            error={errors.provisionName}
          />

          <Select
            label="Categoría"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={categoriesOptions}
            error={errors.category}
          />

          <Select
            label="Unidad de medida"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            options={UNIT_OPTIONS}
            error={errors.unit}
          />

          <Select
            label="Estado del suministro"
            name="status"
            value={formData.status}
            onChange={handleStatusChange} 
            placeholder="Seleccione estado"
            options={STATUS_OPTIONS}
            error={errors.status}
          />

          
        </div>

        {/* COLUMNA 2 */}
        <div className="space-y-4">
          <Input
            label="Stock actual"
            name="stock"
            type="number"
            value={formData.stock}
            placeholder="Ingrese el stock"
            onChange={handleChange}
            error={errors.stock}
          />

          <Input
            label="Precio unitario ($)"
            name="price"
            type="number"
            value={formData.price}
            placeholder="Ingrese el precio"
            onChange={handleChange}
            error={errors.price}
          />

          <Input
            label="Lote"
            name="batch"
            type="text"
            value={formData.batch}
            placeholder="Ingrese el lote"
            onChange={handleChange}
            error={errors.batch}
          />

          <Input
            label="Stock mínimo"
            name="minStock"
            type="number"
            value={formData.minStock}
            placeholder="Ingrese stock mínimo"
            onChange={handleChange}
            error={errors.minStock}
          />

          <Input
            label="Stock máximo"
            name="maxStock"
            type="number"
            value={formData.maxStock}
            placeholder="Ingrese stock máximo"
            onChange={handleChange}
            error={errors.maxStock}
          />
        </div>

        {/* COLUMNA 3 */}
        <div className="flex flex-col justify-between h-full space-y-6">
          <div>
            
            <FileInput
              value={formData.provisionImage}
              onChange={(files) =>
                setFormData((prev) => ({ ...prev, provisionImage: files }))
              }
            />
            {errors.provisionImage && (
              <span className="text-error text-caption block mt-1">
                {errors.provisionImage}
              </span>
            )}
          </div>

          <div className="flex gap-4 items-center justify-end pt-4 border-t border-border/40">
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

