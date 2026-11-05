import { inventoryService } from "./inventory.service.js";

export const inventoryController = {
  async create(req, res) {
    try {
      const item = await inventoryService.create(req.body);
      res.status(201).json({
        message: "Suministro creado correctamente",
        inventoryId: item.id,
      });
    } catch (err) {
      console.log("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const items = await inventoryService.getAll();
      res.json(items);
    } catch (err) {
      console.log("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const item = await inventoryService.getById(Number(req.params.id));
      if (!item) {
        return res.status(404).json({ error: "Suministro no encontrado" });
      }
      res.json(item);
    } catch (err) {
      console.log("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const updated = await inventoryService.update(Number(req.params.id), req.body);
      if (!updated) {
        return res.status(404).json({ error: "Suministro no encontrado" });
      }
      res.json({ message: "Suministro actualizado correctamente", inventoryId: updated.id });
    } catch (err) {
      console.log("ERROR BACKEND:", err);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const deleted = await inventoryService.remove(Number(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "Suministro no encontrado" });
      }
      res.json({
        message: "Suministro eliminado correctamente",
        inventoryId: deleted.id,
      });
    } catch (err) {
      console.log("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },
};
