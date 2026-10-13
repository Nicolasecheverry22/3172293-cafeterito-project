import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import { Input, Button, StatusSwitch, Select, FileInput } from "@/shared";
import { menu as menuData } from "../../menu/data/menu";
import { createMenuSchema } from "../../menu/schemas/editMenuSchema";
import menuCategoryTypes from "../../../data/selects/menuCategoryTypes.json";
import {
  showSystemErrorAlert,
  showDeleteCancelAlert,
  showSuccessAlert,
  showConfirmDeleteAlert,
  showCreateErrorAlert
} from "@/shared/services/alertService";

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categoriesOptions, setCategoriesOptions] = useState(menuCategoryTypes);
  const [errors, setErrors] = useState({});

  const item = menuData.find((p) => String(p.id) === String(id));

  useEffect(() => {
    if (!item) {
      showSystemErrorAlert({
        text: "El platillo que intentas editar no existe.",
      }).then(() => navigate("/menuList", { replace: true }));
    }
  }, [item, navigate]);

  const [formData, setFormData] = useState({
    nombre: item?.productName ?? "",
    categoria: item?.category ?? "",
    precio: item?.price ?? "",
    descripcion: item?.description ?? "",
    estado: item?.isAvailable ?? true,
    imagen: item?.productImage ?? [],
  });

  if (!item) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpia el error del campo cuando el usuario interactúa
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const schema = createMenuSchema({ currentMenuItemId: item.id });
    const result = schema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);

      await showCreateErrorAlert({
        entity: "producto",
        text: "Por favor revisa los errores indicados en el formulario antes de guardar.",
      });
      return;
    }

    setErrors({});

    try {
      Object.assign(item, {
        ...result.data,
        productName: result.data.nombre,
        category: result.data.categoria,
        price: Number(result.data.precio),
        description: result.data.descripcion,
        isAvailable: formData.estado,
        productImage: formData.imagen,
      });

      await showSuccessAlert({
        title: "¡Platillo actualizado!",
        text: "Los cambios fueron guardados correctamente.",
      });

      navigate("/menuList");
    } catch (error) {
      console.error("Error al actualizar el platillo:", error);
      await showSystemErrorAlert({
        text: "Los cambios no pudieron guardarse.",
      });
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
      navigate("/menuList");
    }
  };

  return (
    <div className="bg-surface/70 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-border/40 shadow-2xl">
      <div className="max-w-7xl w-full mx-auto px-4 mb-6 flex items-center gap-3">
        <Pencil className="w-8 h-8 text-text-primary" />
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Editar platillo
        </h1>
      </div>

      <form onSubmit={handleSave} className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA 1 */}
        <div className="space-y-4">
          <Input
            label="Nombre del platillo"
            name="nombre"
            type="text"
            value={formData.nombre}
            placeholder="Ingrese el nombre"
            onChange={handleChange}
            error={errors.nombre}
          />

          <Select
            label="Categoría"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            options={categoriesOptions}
            error={errors.categoria}
          />

          <Input
            label="Precio"
            name="precio"
            type="number"
            min="0"
            step="0.01"
            value={formData.precio}
            placeholder="Ingrese el precio"
            onChange={handleChange}
            error={errors.precio}
          />
        </div>

        {/* COLUMNA 2 */}
        <div className="space-y-4">
          <div className="relative w-full">
            <label className="text-xs text-secondary block mb-1">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={5}
              placeholder="Ingrese descripción del platillo"
              className={`w-full rounded-md border p-3 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                errors.descripcion ? "border-error" : "border-border/40"
              }`}
            />
            {errors.descripcion && (
              <span className="text-error text-caption block mt-1">
                {errors.descripcion}
              </span>
            )}
          </div>

          <div className="flex items-center gap-6 pt-4">
            <span className="text-text-primary font-medium text-body">Estado</span>
            <StatusSwitch
              size="lg"
              checked={formData.estado}
              onChange={(checked) => setFormData((prev) => ({ ...prev, estado: checked }))}
            />
          </div>
        </div>

        {/* COLUMNA 3 */}
        <div className="flex flex-col justify-between h-full space-y-6">
          <div>
            <span className="font-label text-text-primary text-small block mb-2 font-semibold">
              Imagen del platillo
            </span>
            <FileInput
              value={formData.imagen}
              onChange={(files) => {
                setFormData((prev) => ({ ...prev, imagen: files }));
                if (errors.imagen) setErrors((prev) => ({ ...prev, imagen: undefined }));
              }}
              multiple={false}
              accept="image/*"
            />
            {errors.imagen && (
              <span className="text-error text-caption block mt-1">
                {errors.imagen}
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