import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import { Input, Button, Select, FileInput } from "@/shared";
import { getInventoryItem, updateInventoryItem } from "@/services/inventoryApi";
import { createEditProvisionsSchema } from "../../inventory/schemas/editProvisionsSchema";
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
  // Valores que ya existen en la BD (seed 0025)
  { value: "litros", label: "Litros" },
  { value: "unidades", label: "Unidades" },
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
  // Categorías iguales a las de la BD. (categoryTypes.json usa otros nombres, p. ej. "Cárnicos",
  // y con { id } en vez de { value }, por eso no se usa aquí.)
  const [categoriesOptions, setCategoriesOptions] = useState(DEFAULT_CATEGORIES);
  const [errors, setErrors] = useState({});
  const [item, setItem] = useState(null);
  const [formData, setFormData] = useState(null);

  // Carga el suministro real desde la BD
  useEffect(() => {
    getInventoryItem(id)
      .then((data) => {
        setItem(data);
        // Si la categoría guardada no está en la lista, se agrega para no perderla
        setCategoriesOptions((prev) =>
          data.category && !prev.some((c) => c.value === data.category)
            ? [...prev, { value: data.category, label: data.category }]
            : prev
        );
        setFormData({
          provisionName: data.provisionName ?? "",
          category: data.category ?? "",
          status: data.status ?? "Activo",
          unit: data.unit ?? "",
          batch: data.batch ?? "",
          stock: data.stock ?? 0,
          minStock: data.minStock ?? 0,
          maxStock: data.maxStock ?? 0,
          price: data.price ?? "",
          provisionImage: [],
        });
      })
      .catch(() =>
        showSystemErrorAlert({ text: "El suministro que intentas editar no existe." })
          .then(() => navigate("/inventoryList", { replace: true }))
      );
  }, [id, navigate]);

  if (!formData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p className="text-text-secondary">Cargando suministro...</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  

  const handleSave = async (e) => {
    e.preventDefault();

    const schema = createEditProvisionsSchema();
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
      // PUT /api/inventory/:id
      await updateInventoryItem(item.id, {
        provisionName: result.data.provisionName,
        category: result.data.category,
        unit: result.data.unit,
        stock: Number(result.data.stock),
        price: Number(result.data.price),
        batch: result.data.batch,
        minStock: Number(result.data.minStock),
        maxStock: Number(result.data.maxStock),
        status: formData.status,
      });

      await showSuccessAlert({
        title: "¡Suministro actualizado!",
        text: "Los cambios fueron guardados correctamente.",
      });

      navigate("/inventoryList");
    } catch (error) {
      console.error("Error al actualizar el suministro:", error);
      await showSystemErrorAlert({
        text: error.message || "Los cambios no pudieron guardarse.",
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

