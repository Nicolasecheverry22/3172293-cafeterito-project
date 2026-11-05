import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { Input, Button, Select } from "@/shared";
import { getOrderById, updateOrder } from "@/services/orderApi";
import { getUsers } from "@/services/userApi";
import { getProducts } from "@/services/productApi";
import { updateOrderSchema } from "../../ordens/schemas/orderSchema";
import {
  showSystemErrorAlert,
  showDeleteCancelAlert,
  showSuccessAlert,
  showConfirmDeleteAlert,
  showCreateErrorAlert
} from "@/shared/services/alertService";

// Deben coincidir con el CHECK chk_orders_status de la BD
const ORDER_STATUS_OPTIONS = [
  { value: "activa", label: "Activa" },
  { value: "pagada", label: "Pagada" },
  { value: "cancelada", label: "Cancelada" },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount ?? 0);

export default function EditOrder() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [formData, setFormData] = useState(null);
  const [waitersData, setWaitersData] = useState([]);
  const [menuDishesData, setMenuDishesData] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Carga la orden real + opciones de meseros y platillos desde la BD
  useEffect(() => {
    Promise.all([getOrderById(id), getUsers(), getProducts()])
      .then(([order, users, products]) => {
        setItem(order);
        setFormData({
          tableNumber: order.tableNumber ?? "",
          waiterId: order.waiterId ? String(order.waiterId) : "",
          status: order.status ?? "activa",
          observations: order.observations ?? "",
          items: order.items.map((i) => ({
            productId: i.productId,
            dish: i.dish,
            price: i.price, // precio de venta guardado en la orden
            quantity: i.quantity,
          })),
        });
        setWaitersData(
          users
            .filter((u) => u.is_active || u.id === order.waiterId)
            .map((u) => ({ value: String(u.id), label: u.userName }))
        );
        setMenuDishesData(
          products
            .filter((p) => p.isAvailable)
            .map((p) => ({ value: String(p.id), label: p.productName, price: p.price }))
        );
      })
      .catch(() =>
        showSystemErrorAlert({ text: "La orden que intentas editar no existe." })
          .then(() => navigate("/ordensList", { replace: true }))
      );
  }, [id, navigate]);

  if (!formData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p className="text-text-secondary">Cargando orden...</p>
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

  const handleAddItem = (dishValue) => {
    const dishObj = menuDishesData.find((d) => d.value === dishValue);
    if (!dishObj) return;
    const productId = Number(dishObj.value);

    setFormData((prev) => {
      const existing = prev.items.find((i) => i.productId === productId);

      if (existing) {
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }

      return {
        ...prev,
        items: [
          ...prev.items,
          { productId, dish: dishObj.label, price: dishObj.price, quantity: 1 },
        ],
      };
    });
    if (errors.items) {
      setErrors((prev) => ({ ...prev, items: undefined }));
    }
  };

  // Modifica la cantidad sin bajar de 1
  const handleQuantityChange = (index, delta) => {
    setFormData((prev) => {
      const newQty = prev.items[index].quantity + delta;
      if (newQty <= 0) return prev;
      const updated = [...prev.items];
      updated[index] = { ...updated[index], quantity: newQty };
      return { ...prev, items: updated };
    });
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculatedTotal = formData.items.reduce(
    (acc, curr) => acc + curr.price * curr.quantity,
    0
  );

  const handleSave = async (e) => {
    e.preventDefault();

    const result = updateOrderSchema().safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);

      await showCreateErrorAlert({
        entity: "orden",
        text: "Por favor revisa los errores indicados en el formulario antes de guardar.",
      });
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      // PUT /api/orders/:id — el backend conserva el precio de los platillos que ya estaban
      await updateOrder(item.id, {
        tableNumber: Number(result.data.tableNumber),
        waiterId: Number(result.data.waiterId),
        status: result.data.status,
        observations: result.data.observations ?? "",
        items: formData.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });

      await showSuccessAlert({
        title: "¡Orden actualizada!",
        text: "Los cambios fueron guardados correctamente.",
      });

      navigate("/ordensList");
    } catch (error) {
      console.error("Error al actualizar la orden:", error);
      await showSystemErrorAlert({
        text: error.message || "Los cambios no pudieron guardarse.",
      });
    } finally {
      setIsSaving(false);
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
      navigate("/ordensList");
    }
  };

  return (
    <div className="bg-surface/70 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-border/40 shadow-2xl">
      <div className="max-w-7xl w-full mx-auto px-4 mb-6 flex items-center gap-3">
        <Pencil className="w-8 h-8 text-text-primary" />
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Editar Orden #{item.id}
        </h1>
      </div>

      <form onSubmit={handleSave} className="max-w-7xl w-full mx-auto space-y-8">
        {/* Datos Principales de la Orden */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-surface p-6 rounded-2xl border border-border/40 shadow-sm">
          <Input
            label="Observaciones"
            name="observations"
            type="text"
            value={formData.observations}
            placeholder="Ej: sin cebolla"
            onChange={handleChange}
            error={errors.observations}
          />

          <Input
            label="Número de mesa"
            name="tableNumber"
            type="number"
            min="1"
            value={formData.tableNumber}
            placeholder="Mesa #"
            onChange={handleChange}
            error={errors.tableNumber}
          />

          <Select
            label="Mesero asignado"
            name="waiterId"
            value={formData.waiterId}
            onChange={handleChange}
            options={waitersData}
            placeholder="Seleccione mesero"
            error={errors.waiterId}
          />

          <Select
            label="Estado"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={ORDER_STATUS_OPTIONS}
            error={errors.status}
          />
        </div>

        {/* Selección y Gestión de Platillos */}
        <div className="bg-surface p-6 rounded-2xl border border-border/40 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-lg font-heading font-bold text-text-primary">
              Platillos de la Orden
            </h3>

            <div className="w-full md:w-72">
              <Select
                placeholder="Añadir platillo..."
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddItem(e.target.value);
                    e.target.value = "";
                  }
                }}
                options={menuDishesData}
              />
            </div>
          </div>
          {errors.items && (
            <span className="text-error text-caption block mt-1">
              {errors.items}
            </span>
          )}

          {/* Tabla Dinámica de Selección */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-text-primary/70 font-semibold">
                  <th className="py-2 px-3">Platillo</th>
                  <th className="py-2 px-3 text-right">Precio Unitario</th>
                  <th className="py-2 px-3 text-center">Cantidad</th>
                  <th className="py-2 px-3 text-right">Subtotal</th>
                  <th className="py-2 px-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.length > 0 ? (
                  formData.items.map((rowItem, index) => (
                    <tr key={rowItem.productId} className="border-b border-border/20">
                      <td className="py-3 px-3 font-medium text-text-primary">
                        {rowItem.dish || rowItem.productName}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {formatCurrency(rowItem.price)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={(e) => {
                                e.stopPropagation(); // Evita que el evento se propague doble
                                handleQuantityChange(index, -1);
                                }}
                                className="w-7 h-7 rounded-md bg-surface-muted hover:bg-border/30 flex items-center justify-center font-bold text-text-primary"
                            >
                                -
                            </button>
                            <span className="w-8 text-center font-semibold">
                                {rowItem.quantity}
                            </span>
                            <button
                                type="button"
                                onClick={(e) => {
                                e.stopPropagation(); // Evita que el evento se propague doble
                                handleQuantityChange(index, 1);
                                }}
                                className="w-7 h-7 rounded-md bg-surface-muted hover:bg-border/30 flex items-center justify-center font-bold text-text-primary"
                            >
                                +
                            </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-text-primary">
                        {formatCurrency(rowItem.price * rowItem.quantity)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-text-primary/60">
                      No se han seleccionado platillos para esta orden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end items-center pt-4 border-t border-border/40">
            <p className="text-xl font-heading font-bold text-text-primary">
              Total Actual: <span className="text-primary">{formatCurrency(calculatedTotal)}</span>
            </p>
          </div>
        </div>

        {/* Acciones de Guardado */}
        <div className="flex gap-4 items-center justify-end pt-4 border-t border-border/40">
          <Button variant="secondary" size="md" type="button" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button variant="primary" size="md" type="submit" disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}