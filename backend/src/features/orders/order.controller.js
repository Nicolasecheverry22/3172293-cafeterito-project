import { orderService } from "./order.service.js";
import { httpError } from "../../utils/httpError.js";

// Traduce las violaciones de constraints propias de órdenes a mensajes claros
// según err.constraint. Cualquier otro error sigue hacia el middleware global.
const translateOrderError = (err) => {
  if (err.code === "23505" && err.constraint === "uq_orders_active_table") {
    return httpError(409, "Esta mesa ya tiene una orden activa");
  }
  if (err.code === "23503" && err.constraint === "fk_orders_waiter") {
    return httpError(400, "El empleado encargado no existe");
  }
  return err;
};

const withOrderErrors = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (err) {
    throw translateOrderError(err);
  }
};

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
