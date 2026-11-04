import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { Input, Button, Select } from "@/shared";
import { ordens } from "../../ordens/data/ordens";
import { waitersData, menuDishesData } from "../../ordens/data/orderMockData";
import { updateOrderSchema } from "../../ordens/schemas/orderSchema";
import {
  showSystemErrorAlert,
  showDeleteCancelAlert,
  showSuccessAlert,
  showConfirmDeleteAlert,
  showCreateErrorAlert
} from "@/shared/services/alertService";

const ORDER_STATUS_OPTIONS = [
  { value: "activa", label: "Activa" },
  { value: "pagada", label: "Pagada" },
];

export default function EditOrder() {
  const navigate = useNavigate();
  const { id } = useParams();

  const item = ordens.find((o) => String(o.id) === String(id));
  const [errors, setErrors] = useState({});

  const initialWaiter = waitersData.find(
    (w) => w.label === item?.waiter || w.value === item?.waiterId
  )?.value || "";

  const [formData, setFormData] = useState({
    clientName: item?.clientName ?? "Cliente Ocasional",
    tableNumber: item?.tableNumber ?? "",
    waiterId: initialWaiter,
    status: item?.status?.toLowerCase() ?? "activa",
    items: item?.items ?? [],
  });

  useEffect(() => {
    if (!item) {
      showSystemErrorAlert({
        text: "La orden que intentas editar no existe.",
      }).then(() => navigate("/ordensList", { replace: true }));
    }
  }, [item, navigate]);

  if (!item) return null;

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

    setFormData((prev) => {
      const existingIndex = prev.items.findIndex(
        (i) => (i.dish || i.productName) === dishObj.label
      );

      if (existingIndex >= 0) {
        const updatedItems = [...prev.items];
        updatedItems[existingIndex].quantity += 1;
        return { ...prev, items: updatedItems };
      }

      return {
        ...prev,
        items: [
          ...prev.items,
          { 
            dishId: dishObj.value, 
            dish: dishObj.label, 
            price: dishObj.price, 
            quantity: 1, 
            dispatched: false 
          },
        ],
      };
    });
    if (errors.items) {
      setErrors((prev) => ({ ...prev, items: undefined }));
    }
  };

  // Modificar cantidad de un platillo de forma segura
    const handleQuantityChange = (index, delta) => {
    setFormData((prev) => {
      const updated = [...prev.items];
      const currentItem = updated[index];
      
      // Calculamos la nueva cantidad asegurando que no baje de 1
      const newQty = currentItem.quantity + delta;
      if (newQty <= 0) {
        // Si llega a 0 o menos, puedes decidir si eliminarlo o dejarlo en 1
        return prev; // O usar splice si deseas eliminarlo al llegar a 0
      }

      updated[index] = {
        ...currentItem,
        quantity: newQty,
      };

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

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleSave = async (e) => {
    e.preventDefault();

    // Usamos el esquema exclusivo para actualización
    const schema = updateOrderSchema({ currentOrderId: item.id });
    const result = schema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        fieldErrors[fieldName] = issue.message;
      });
      setErrors(fieldErrors);

      await showCreateErrorAlert({
        entity: "orden",
        text: "Por favor revisa los errores indicados en el formulario antes de guardar.",
      });
      return;
    }

    setErrors({});

    try {
      const selectedWaiter = waitersData.find((w) => w.value === formData.waiterId);

      Object.assign(item, {
        clientName: formData.clientName,
        tableNumber: Number(result.data.tableNumber),
        waiterId: formData.waiterId,
        waiter: selectedWaiter ? selectedWaiter.label : item.waiter,
        status: formData.status,
        items: formData.items,
      });

      await showSuccessAlert({
        title: "¡Orden actualizada!",
        text: "Los cambios fueron guardados correctamente.",
      });

      navigate("/ordensList");
    } catch (error) {
      console.error("Error al actualizar la orden:", error);
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
            label="Nombre del cliente"
            name="clientName"
            type="text"
            value={formData.clientName}
            placeholder="Ingrese el cliente"
            onChange={handleChange}
            error={errors.clientName}
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
                    <tr key={index} className="border-b border-border/20">
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
          <Button variant="primary" size="md" type="submit">
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}