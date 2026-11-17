import { orderService } from "./order.service.js";
import { withConstraintErrors } from "../../utils/constraintErrors.js";

// Mensajes según err.constraint; cualquier otro error sigue al middleware global (H53).
const withOrderErrors = withConstraintErrors({
  uq_orders_active_table: [409, "Esta mesa ya tiene una orden abierta"],
  fk_orders_waiter: [400, "El empleado encargado no existe"],
});

export const orderController = {
  getAll: withOrderErrors(async (req, res) => {
    res.json(await orderService.getAll());
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
    const order = await orderService.create(req.body);
    res.status(201).json({ message: "Orden creada correctamente", orderId: order.id });
  }),

  update: withOrderErrors(async (req, res) => {
    const updated = await orderService.update(Number(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }
    res.json({ message: "Orden actualizada correctamente", orderId: updated.id });
  }),

  remove: withOrderErrors(async (req, res) => {
    const deleted = await orderService.remove(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }
    res.json({ message: "Orden eliminada correctamente", orderId: deleted.id });
  }),
};
