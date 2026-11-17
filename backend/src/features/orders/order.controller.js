import { orderService } from "./order.service.js";
import { withConstraintErrors } from "../../utils/constraintErrors.js";

// Mensajes según err.constraint; cualquier otro error sigue al middleware global (H53).
const withOrderErrors = withConstraintErrors({
  uq_orders_active_table: [409, "Esta mesa ya tiene una orden abierta"],
  fk_orders_waiter: [400, "El empleado encargado no existe"],
});

export const orderController = {
  getAll: withOrderErrors(async (req, res) => {
    res.json(await orderService.list(req.query));
  }),

  getById: withOrderErrors(async (req, res) => {
    const order = await orderService.getById(Number(req.params.id));
    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }
    res.json(order);
  }),

  getReportData: withOrderErrors(async (req, res) => {
    const { tableNumber } = req.query;
    res.json(await orderService.getReportData(tableNumber));
  }),

  create: withOrderErrors(async (req, res) => {
    const order = await orderService.create(req.body, req.user.id);
    res.status(201).json({ message: "Orden creada correctamente", orderId: order.id });
  }),

  update: withOrderErrors(async (req, res) => {
    const updated = await orderService.update(Number(req.params.id), req.body, req.user.id);
    if (!updated) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }
    res.json({ message: "Orden actualizada correctamente", orderId: updated.id });
  }),

  // PATCH /api/orders/:id/cancel — anular (el frontend pide confirmación antes)
  cancel: withOrderErrors(async (req, res) => {
    const cancelled = await orderService.cancel(Number(req.params.id));
    if (!cancelled) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }
    res.json({ message: "Orden anulada correctamente", orderId: cancelled.id, status: cancelled.status });
  }),
};
