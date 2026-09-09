import { useState, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input, Select, Button } from "@/shared";
import { createOrderSchema } from "../schemas/orderSchema";
import { waitersData, menuDishesData } from "../data/orderMockData";

const DEFAULT_FORM_DATA = { tableNumber: "", waiterId: "", observations: "" };

export default function OrderForm({
  mode = "create", // "create" | "edit"
  initialData = null,
  initialItems = null,
  currentOrderId = null,
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState(initialData ?? DEFAULT_FORM_DATA);
  const [orderItems, setOrderItems] = useState(
    initialItems ?? [{ id: crypto.randomUUID(), dishId: "", quantity: 1 }]
  );
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id, field, value) => {
    setOrderItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const addDishRow = () => {
    setOrderItems((prev) => [...prev, { id: crypto.randomUUID(), dishId: "", quantity: 1 }]);
  };

  const removeDishRow = (id) => {
    setOrderItems((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  };

  // Resumen y total en vivo — RFADMIN26
  const summary = useMemo(() => {
    return orderItems
      .filter((item) => item.dishId)
      .map((item) => {
        const dish = menuDishesData.find((d) => d.value === item.dishId);
        const quantity = Number(item.quantity) || 0;
        const price = dish?.price ?? 0;
        return { id: item.id, label: dish?.label ?? "—", quantity, subtotal: price * quantity };
      });
  }, [orderItems]);

  const total = summary.reduce((sum, row) => sum + row.subtotal, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const schema = createOrderSchema({ currentOrderId });
    const result = schema.safeParse({ ...formData, items: orderItems });

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        // Errores dentro del array "items" llegan con path ["items", index, "campo"];
        // los mapeamos a un solo mensaje visible bajo "items" para no complicar el UI.
        const key = issue.path[0] === "items" ? "items" : issue.path[0];
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit({ ...result.data, total });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Número de mesa"
        name="tableNumber"
        type="number"
        value={formData.tableNumber}
        onChange={handleChange}
        placeholder="No. Mesa"
        className="text-center font-bold"
        error={errors.tableNumber}
      />

      <Select
        label="Empleado encargado"
        name="waiterId"
        value={formData.waiterId}
        onChange={handleChange}
        options={waitersData}
        error={errors.waiterId}
      />

      <div className="space-y-4">
        <label className="block text-caption text-text-secondary font-medium">
          Platillos / Productos del Menú
        </label>

        {orderItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="flex-1">
              <Select
                name={`dish-${item.id}`}
                value={item.dishId}
                onChange={(e) => handleItemChange(item.id, "dishId", e.target.value)}
                options={menuDishesData}
              />
            </div>
            <div className="w-24">
              <Input
                name={`qty-${item.id}`}
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                placeholder="Cant"
              />
            </div>
            <button
              type="button"
              onClick={() => removeDishRow(item.id)}
              className="p-3 text-text-muted hover:text-error hover:bg-error/10 transition-colors rounded-lg flex items-center justify-center h-12 border border-border"
              aria-label="Eliminar platillo"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        {errors.items && <span className="text-error text-caption block">{errors.items}</span>}

        <Button
          variant="secondary"
          type="button"
          onClick={addDishRow}
          className="flex items-center justify-center gap-2 w-full md:w-auto bg-brand/30 hover:bg-brand/50 text-text-primary font-medium"
        >
          Agregar producto <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div>
        <label className="block text-caption text-text-secondary font-medium mb-1">Observaciones</label>
        <textarea
          name="observations"
          value={formData.observations}
          onChange={handleChange}
          rows={3}
          placeholder="Ej: sin cebolla, para llevar, alergias..."
          className="w-full rounded-lg border border-border bg-background p-3 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-focus-border"
        />
        {errors.observations && (
          <span className="text-error text-caption block mt-1">{errors.observations}</span>
        )}
      </div>

      {summary.length > 0 && (
        <div className="border-t border-border pt-4 space-y-2">
          <h3 className="font-heading font-bold text-text-primary text-body">Resumen del pedido</h3>
          {summary.map((row) => (
            <div key={row.id} className="flex justify-between text-small text-text-secondary">
              <span>{row.label} × {row.quantity}</span>
              <span>${row.subtotal.toLocaleString("es-CO")}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-text-primary text-body pt-2 border-t border-border">
            <span>Total</span>
            <span>${total.toLocaleString("es-CO")}</span>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-64 py-3 text-base font-bold shadow-md"
        >
          {isSubmitting ? "Guardando..." : mode === "edit" ? "Guardar Cambios" : "Crear orden"}
        </Button>
      </div>
    </form>
  );
}