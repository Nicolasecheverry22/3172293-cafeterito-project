import { orderService } from "./order.service.js";

// Traduce errores de PostgreSQL / de negocio a respuestas HTTP claras.
const handleError = (res, err) => {
  console.log("ERROR BACKEND:", err);

  // 23505 = unique_violation -> índice uq_orders_active_table
  if (err.code === "23505") {
    return res.status(409).json({ error: "Esta mesa ya tiene una orden activa" });
  }
  // 23503 = foreign_key_violation -> mesero inexistente
  if (err.code === "23503") {
    return res.status(400).json({ error: "El empleado encargado no existe" });
  }

  res.status(err.statusCode || 500).json({ error: err.message });
};

export const orderController = {
  async getAll(req, res) {
    try {
      res.json(await orderService.getAll());
    } catch (err) {
      handleError(res, err);
    }
  },

  async getById(req, res) {
    try {
      const order = await orderService.getById(Number(req.params.id));
      if (!order) {
        return res.status(404).json({ error: "Orden no encontrada" });
      }
      res.json(order);
    } catch (err) {
      handleError(res, err);
    }
  },

  async create(req, res) {
    try {
      const order = await orderService.create(req.body);
      res.status(201).json({
        message: "Orden creada correctamente",
        orderId: order.id,
      });
    } catch (err) {
      handleError(res, err);
    }
  },

  async update(req, res) {
    try {
      const updated = await orderService.update(Number(req.params.id), req.body);
      if (!updated) {
        return res.status(404).json({ error: "Orden no encontrada" });
      }
      res.json({ message: "Orden actualizada correctamente", orderId: updated.id });
    } catch (err) {
      handleError(res, err);
    }
  },

  async remove(req, res) {
    try {
      const deleted = await orderService.remove(Number(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "Orden no encontrada" });
      }
      res.json({ message: "Orden eliminada correctamente", orderId: deleted.id });
    } catch (err) {
      handleError(res, err);
    }
  },
};
